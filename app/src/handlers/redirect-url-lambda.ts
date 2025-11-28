//lambda to redirect by code of the path url if the code exits in the data base
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import createHttpError from "http-errors";
import { DynamoService } from "../databases/dynamodb";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

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

    return {
        statusCode: 302,
        body: JSON.stringify({ success: true }),
        headers: {
            Location: originalUrl
        }
    }
}

export const handler = middy<APIGatewayEvent, APIGatewayProxyResult>(
    redirectToUrlByCodeLambda
).use(httpErrorHandler())