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

    return {
        statusCode: 200,
        body: JSON.stringify(urlDataFromDb),
        headers: {
            "Content-type": "application/json",
        }
    }
}

export const handler = middy<APIGatewayEvent, APIGatewayProxyResult>(
    redirectToUrlByCodeLambda
).use(httpErrorHandler())