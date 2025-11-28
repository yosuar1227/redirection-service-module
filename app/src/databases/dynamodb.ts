//dynamodb configgurationimport { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";

export const LINK_CODE_GROUP = 'LINK_CODE';

export class DynamoService {

    private readonly client = DynamoDBDocumentClient.from(
        new DynamoDBClient({}),
        {
            marshallOptions: {
                convertClassInstanceToMap: true,
                removeUndefinedValues: true,
            },
        }
    );

    constructor() { }

    async get(urlCode: string) {
        if (!urlCode.startsWith(LINK_CODE_GROUP)) {
            urlCode = `${LINK_CODE_GROUP}-${urlCode}`
        }

        try {
            const comand = new GetCommand({
                TableName: process.env.ShortLinkTable || "",
                Key: {
                    uuid: urlCode,
                    linkCode: LINK_CODE_GROUP
                },
            });

            const response = await this.client.send(comand);

            return response.Item || null;
        } catch (error) {
            console.error("Error getting the item", error);
            return null;
        }
    }


}