//lambda to redirect by code of the path url if the code exits in the data base
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import createHttpError from "http-errors";
import { DynamoService, LINK_CLICK_CODE_GROUP } from "../databases/dynamodb";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { v4 as uuidv4 } from "uuid";
import { getFormattedDate } from "../utils/util.functions";

type ClickDataForDb = {
    uuid: string,
    linkCode: string,
    created: string,
}

const redirectToUrlByCodeLambda = async (
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
    const urlCode = event.pathParameters?.urlCode;

    if (!urlCode) {
        throw createHttpError.BadRequest("Missing mandatory urlCode value.");
    }

    const urlDataFromDb = await new DynamoService().get(urlCode);

    if (urlDataFromDb === null) {
        throw createHttpError.BadRequest(`Url code ${urlCode} does not exits in the data base.`)
    }

    console.log("URL DATA FORM DATA BASE::", urlDataFromDb);

    const originalUrl = urlDataFromDb?.fullUrl;

    if (!originalUrl) {
        throw createHttpError.InternalServerError("Cannot continue without Original Url")
    }

    console.log("ORIGINAL URL::", originalUrl);

    //increasing the total clicks records
    const itemCopy = {
        ...urlDataFromDb,
        totalClicks: urlDataFromDb.totalClicks + 1
    };

    const resp = await new DynamoService().save(itemCopy);
    console.log("Dynamo response...", resp);

    //saving the click record for the specific code and date with format dd-mm-yyyy
    const clickDataForDb: ClickDataForDb = {
        uuid: `${LINK_CLICK_CODE_GROUP}-${uuidv4()}`,
        linkCode: `${LINK_CLICK_CODE_GROUP}-${urlCode}`,
        created: getFormattedDate()
    }

    const resp2 = await new DynamoService().save(clickDataForDb);
    console.log("Dynamo response...", resp2);

    return {
        statusCode: 302,
        body: JSON.stringify({ success: true }),
        headers: {
            Location: originalUrl,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET",
        }
    }
}

export const handler = middy<APIGatewayEvent, APIGatewayProxyResult>(
    redirectToUrlByCodeLambda
).use(httpErrorHandler())