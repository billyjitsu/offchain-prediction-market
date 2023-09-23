import "@phala/pink-env";
import { Coders } from "@phala/ethers";
import { string } from "hardhat/internal/core/params/argumentTypes";

type HexString = `0x${string}`;

// eth abi coder
const uintCoder = new Coders.NumberCoder(32, false, "uint256");
const bytesCoder = new Coders.BytesCoder("bytes");
// Encode Address
const addressCoder = new Coders.AddressCoder("address");
// Encode Array of addresses with a length of 10
const addressArrayCoder = new Coders.ArrayCoder(addressCoder, 10, "address");
// Encode Array of bytes with a length of 10
const bytesArrayCoder = new Coders.ArrayCoder(bytesCoder, 10, "bytes");
// Encode Array of uint with a length of 10
const uintArrayCoder = new Coders.ArrayCoder(uintCoder, 10, "uint256");

function encodeReply(reply: [number, number, number]): HexString {
  return Coders.encode([uintCoder, uintCoder, uintCoder], reply) as HexString;
}

// Defined in TestLensOracle.sol
const TYPE_RESPONSE = 0;
const TYPE_ERROR = 2;

enum Error {
  BadLensProfileId = "BadLensProfileId",
  FailedToFetchData = "FailedToFetchData",
  FailedToDecode = "FailedToDecode",
  MalformedRequest = "MalformedRequest",
}

function errorToCode(error: Error): number {
  switch (error) {
    case Error.BadLensProfileId:
      return 1;
    case Error.FailedToFetchData:
      return 2;
    case Error.FailedToDecode:
      return 3;
    case Error.MalformedRequest:
      return 4;
    default:
      return 0;
  }
}

function isHexString(str: string): boolean {
  const regex = /^0x[0-9a-f]+$/;
  return regex.test(str.toLowerCase());
}

function stringToHex(str: string): string {
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return "0x" + hex;
}

function fetchYouTubeStats(lensApi: string, profileId: string): any {
  // profile_id should be like 0x0001
  let headers = {
    "Content-Type": "application/json",
    "User-Agent": "phat-contract",
  };

  // let query = JSON.stringify({
  //   query: `query Profile {
  //           profile(request: { profileId: \"${profileId}\" }) {
  //               stats {
  //                   totalFollowers
  //                   totalFollowing
  //                   totalPosts
  //                   totalComments
  //                   totalMirrors
  //                   totalPublications
  //                   totalCollects
  //               }
  //           }
  //       }`,
  // });
  // let body = stringToHex(query);
  //
  // In Phat Function runtime, we not support async/await, you need use `pink.batchHttpRequest` to
  // send http request. The function will return an array of response.
  //
  let response = pink.batchHttpRequest(
    [
      {
        url: `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=Jfk6-lZUUvQ&key=AIzaSyBPBq9E_QfeZTNyWSbGYH8Tc0wKoiBboGc`,
        method: "GET",
        headers,
        //body, //optional
        returnTextBody: true,
      },
    ],
    10000
  )[0];
  //console.log("response",response);
  if (response.statusCode !== 200) {
    console.log(
      `Fail to read Lens api with status code: ${response.statusCode}, error: ${
        response.error || response.body
      }}`
    );
    throw Error.FailedToFetchData;
  }
  let respBody = response.body;
  let respJson = JSON.parse(respBody as string);
  // console.log("respJson",respJson);
  let finalResp = respJson.items[0].statistics.viewCount;
  console.log("finalResp", finalResp);
  if (typeof respBody !== "string") {
    throw Error.FailedToDecode;
  }
  //return JSON.parse(respBody);
  return finalResp;
}

function parseProfileId(hexx: string): string {
  var hex = hexx.toString();
  if (!isHexString(hex)) {
    throw Error.BadLensProfileId;
  }
  hex = hex.slice(2);
  var str = "";
  for (var i = 0; i < hex.length; i += 2) {
    const ch = String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    str += ch;
  }
  return str;
}

export default function main(request: HexString, settings: string): HexString {
  console.log(`handle req: ${request}`);
  let requestId, encodedProfileId;
  try {
    [requestId, encodedProfileId] = Coders.decode(
      [uintCoder, bytesCoder],
      request
    );
  } catch (error) {
    console.info("Malformed request received");
    return encodeReply([TYPE_ERROR, 0, errorToCode(error as Error)]);
  }
  const profileId = parseProfileId(encodedProfileId as string);
  console.log(`Request received for profile ${profileId}`);

  try {
    const respData = fetchYouTubeStats(settings, profileId);
    // let stats = respData.data.profile.stats.totalCollects;
    let stats = respData;
    console.log("response:", [TYPE_RESPONSE, requestId, stats]);
    return encodeReply([TYPE_RESPONSE, requestId, stats]);
  } catch (error) {
    if (error === Error.FailedToFetchData) {
      throw error;
    } else {
      // otherwise tell client we cannot process it
      console.log("error:", [TYPE_ERROR, requestId, error]);
      return encodeReply([TYPE_ERROR, requestId, errorToCode(error as Error)]);
    }
  }

  // function sendTGMessage(msg: string) {
  //   const strMsg = JSON.stringify(msg)
  //   console.log(strMsg.toString())
  //   console.log(msg.toString())
  //   const tg_bot_http_endpoint = `https://api.telegram.org/bot6365043287:AAGd0jeyMmv1W7FJ7K_12y_PgpTQ5qFjbXw/sendMessage?chat_id=-1001986190934&text=`;
  //   let headers = {
  //     "Content-Type": "application/json",
  //     "User-Agent": "phat-contract",
  //   };
  //   const res3 = pink.httpRequest({
  //     url: `${tg_bot_http_endpoint}\n${msg}`,
  //     method: "POST",
  //     headers,
  //     returnTextBody: true,
  //   });
  //   console.info(res3);
  // }
}
