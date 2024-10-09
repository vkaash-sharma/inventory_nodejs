const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const path = require("path");
const crypto = require("crypto");
const clog = require("../services/ChalkService");
const { commonConfig } = require("../config/config");
const { isString } = require("../services/CommonService");
const { s3FileObject, S3TempAccessUrl } = require("../services/AwsService");
const { verifyJWTToken } = require("../services/AwsSecretManager");

/* Function to Generate S3 Signed Url */
exports.s3SignedUrl = async (req, res) => {
  try {
    const { fileName, fileType, groupID, folder } = req.body;
    const extension = path.extname(fileName);
    const randomString = crypto.randomBytes(16).toString("hex");
    const timestamp = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, "");
    const Key =
      folder !== "documents"
        ? `${folder}/${randomString}_${timestamp}${extension}`
        : `${folder}/${groupID}/${randomString}_${timestamp}${extension}`;
    const s3 = new AWS.S3({
      accessKeyId: commonConfig.accessKeyID,
      secretAccessKey: commonConfig.secretKeyID,
      region: commonConfig.bucketRegion,
    });
    const params = {
      Bucket: commonConfig.bucketName,
      Key: Key,
      ContentType: fileType,
      Expires: 3600, // URL expiration time in seconds
    };
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    if (uploadURL) {
      return res.REST.SUCCESS(1, "SuccessFull", {
        data: uploadURL,
        fileName: Key,
      });
    } else {
      return res.REST.SERVERERROR(0, "Error While Creating Signed Url");
    }
  } catch (error) {
    clog.error(error);
    res.REST.BADREQUEST(0, "Error While Creating Signed Url", error);
  }
};

exports.readS3File = async (req, res) => {
  const { url, token, documentName } = req.query;
  const key = isString(url) ? url.split("amazonaws.com/")[1] : null;
  // Decode Token
  const decoded = verifyJWTToken(token);
  if (!decoded.status) return res.end();
  // Get Data for File
  const data = await s3FileObject(key);
  // chalklog.success(data.data)
  if (!data.status) return res.end();
  let fileName = documentName || "SampleFile";
  // Setting FileName As per Content-Disposition if Available
  if (data?.data?.ContentDisposition) {
    const disposition = data?.data?.ContentDisposition;
    const matches = disposition.match(/filename="(.+?)"/);
    if (matches && matches.length > 1) {
      fileName = matches[1];
    }
  }
  // Content-Deposition
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  // Content-Type
  res.setHeader(
    "Content-Type",
    data?.data?.ContentType || "application/octet-stream"
  );
  return res.send(data.data.Body);
};

exports.getS3Image = async (req, res) => {
  try {
    const { url, documentName } = req.query;
    const key = isString(url) ? url.split("amazonaws.com/")[1] : null;
    if (!key) {
      return res.send("Key not found");
    }
    // Get Data for File
    const data = await s3FileObject(key);
    if (data?.status) {
      let fileName = key;
      // Setting FileName As per Content-Disposition if Available
      if (data?.data?.ContentDisposition) {
        const disposition = data?.data?.ContentDisposition;
        const matches = disposition.match(/filename="(.+?)"/);
        if (matches && matches.length > 1) {
          fileName = matches[1];
        }
      }
      // Content-Deposition
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      // Content-Type
      res.setHeader(
        "Content-Type",
        data?.data?.ContentType || "application/octet-stream"
      );
      return res.send(data.data.Body);
    } else {
      return res.status(404).json(data);
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

/* S3 Api to get Temporary S3 Access Url */
exports.getTempS3Url = async (req, res) => {
  try {
    let tempData = await S3TempAccessUrl(req.query.key);
    if (tempData?.status === 1) {
      return res.json(tempData);
    } else {
      return res.status(400).json(tempData);
    }
  } catch (error) {
    return res.send(error);
  }
};

exports.s3urltoKey = (url) => {
  if (url.includes("amazonaws.com/")) {
    return isString(url) ? url.split("amazonaws.com/")[1] : null;
  } else {
    return url;
  }
};
