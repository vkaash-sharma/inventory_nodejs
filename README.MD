### Quick Links

- [Prerequisites](#Prerequisites)

- [Setup](#Setup)

- [Project Structure](#Project-Structure)

- [Application design](#Application-design)

### <a name="Prerequisites"></a>Prerequisites

- NodeJS version 18.17.1 ( Refer to https://nodejs.org/en/ to install nodejs )

### <a name="Setup"></a>Setup

Clone the project into local

```

git clone git@gitlab.com:amit_codefire/cf_base_node.git

```

Navigate to the project directory

```bash

cd cf_base_node

```

Install all the npm packages. Go into the project folder and type the following command to install all npm packages

```bash

npm install

```

In order to run the application Type the following command

```bash

npm run dev

```

App is Accessible on the [[http://localhost:4000/api]]

where port is defined in .env

### <a name="Project-Structure"></a>Project Structure

project-root/

│

├── bin/

│ └── www.js

│

├── node_modules/

│ └── (dependencies)

│

├── src/

│ ├── config/ (configurations)

│ │ ├── action.config.js

│ │ ├── config.js

│ │ ├── events.config.js

│ │ ├── i18.config.js

│ │ └── urls.config.js

│ │

│ ├── controllers/

│ │ └── (api controllers)

│ │

│ ├── locale/ (diffrent i18n locales)

│ │ ├── en.json

│ │ └── hi.json

│ │

│ ├── middleware/

│ │ └── jwt_auth.js

│ │

│ ├── models/

│ │ └── (db models)

│ │

│ ├── routes/

│ │ ├── api.js (api middleware)

│ │ └── (api routes)

│ │

│ ├── services/

│ │ └── (services functions)

│

├── .env

├── .gitignore

├── index.js

├── package-lock.json

├── package.json

└── README.md

### <a name="Application-design"></a>Application design

**bin/www** : This folder contains www.js file where all server is started . www.js file is file which will execute first.

**src/config** : All the configuraton variable is present inside this folder.

**src/controllers** : All controllers like Auth , User , UploadFile are placed here.

**src/locales** : All multilinguale json file are present inside locales folder .

**src/middleware** : All middleware are present inside this folder .

**src/models** : All database table schema models are present inside this folder .

**src/routes** : All routes of an API are present inside this folder

**src/services** : This folder contains Various database I/O services , email services , JOI validations services , ChalkServices , Event services etc

**src/index.js** : This file contains all server configuration

## Resources

**Nodejs** : Refer to https://nodejs.org/en/ to understand the concepts of Nodejs

**Express** : Refer to https://expressjs.com/ to understand how to use Express

**Axios** : To understand how to use Axios for making HTTP calls, please refer to the official Axios documentation on its npm package page: https://www.npmjs.com/package/axios

**bcryptjs** : This is a hash generation package , which is used to hash password to make more secure database, refer to https://www.npmjs.com/package/bcryptjs to understand how to use bcrypt

**chalk** : This is used to make console log in more readable format by changing color of log , refer to https://www.npmjs.com/package/chalk to understand more about chalk

**i18n** : This library for internationalization. https://www.i18next.com/misc/migration-guide#nodejs--express

**helmet** : Helmet.js is a Node.js module that helps in securing HTTP headers. It is implemented in express applications https://helmetjs.github.io/ for more understanding

**jsonwebtoken** : JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties. https://jwt.io/ to read more

**sequelize** : Sequelize is a modern TypeScript and Node.js ORM for Oracle, Postgres, MySQL, MariaDB, SQLite and SQL Server, and more. https://sequelize.org/

**nodemailer** : Nodemailer is a module for Node.js applications to allow easy as cake email sending. https://nodemailer.com/

**multer** : Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency. https://github.com/expressjs/multer

**joi** : The most powerful schema description language and data validator for JavaScript https://joi.dev/

### MiddleWares

**I18nMiddleware(i18nMiddleware.js):**

This middleware wraps the i18n and initialises it, and changes the diffrent locales based upon the `req.headers['accept-language']` Requirement from app to backend

**isAuth (jwt_auth.js):**

This middleware is the crucial as it works as a authentication upon private apis, it verifies the token from frontend `req.headers['x-access-token'] `or `req.headers['authorization']` and confirm that the users exists as well.

It sends the current user object with it's details within req , can be accessed using `let user = req.user` within api controllers.

**RestMiddleware(RestMiddleWare.js):**

Provides easy to use http status codes and default message by objects written in <u>./src/services/response/status-code.json</u>

How to use:

Using RestMiddleware:

```javascript
async function apiController(req, res) {
  // Api logic...

  let data; // result data if you wanted to send

  if (condition) {
    return res.REST.SUCCESS(1, "Success Message", data);
  } else {
    return res.REST.ERROR(0, "Error Message", data);
  }
}
```

Using Normal:

```javascript
async function apiController(req, res) {
  // Api logic...

  let data; // result data if you wanted to send

  if (condition) {
    return res.status(200).json({
      status: 1,

      statusType: "success",

      message: "Success Message",

      data: data,
    });
  } else {
    return res.status(400).json({
      status: 0,

      statusType: "error",

      message: "Error Message",

      data: data,
    });
  }
}
```

NOTE: Total 64 rest methods are available such as :

SUCCESS(200),ERROR(400),SERVERERROR(500),FORBIDDEN(403)...

and more can be added within status-code.json file.

**SecurityMiddleware(securityHeaders.js):**

Middleware comes for the security headers in api, such as CORS and others, it can be modified to add more.

**validatorMiddleWare(validatorMiddleWare.js):**

This middleware is required for api body validation,

How to use

1. Create a Validation Schema using joi

```javascript
// ./src/validation/

const RouteValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid Email Address",

    "string.empty": "Email is Required",
  }),

  password: Joi.string().min(8).regex(passwordRegex).required().messages({
    "string.empty": "Password is Required",

    "string.min": "Password must be more than 8 characters",

    "string.pattern.base": "Password should be combination of Alphanumeric",
  }),
});
```

2. Add RouteValidationSchema to middleware on api route

```javascript
// ./src/Routes/route.js

Router.post("/login", apiValidator(RouteValidationSchema), routeController);
```

3. This will verifies the api body and provides access to controller if it's validated else responses with error:

```json
// status: 403(Forbidden)

{
  "status": 0,

  "statusType": "error",

  "message": "firstName is required"
}
```

### Service Functions

**PDF Conversion Utilities**
This package provides simple utilities for converting PDF files to text, text to PDF documents, and HTML content to PDF documents.

Functions

- `pdfToText(pdfPath)`: Converts a PDF file to text. Returns a Promise resolving with a text Buffer.

- `textToPdf(text)`: Converts text to a PDF document. Returns a Promise resolving with a PDF Buffer.

- `htmlToPdf(html, type = 'url', pageSize = 'A4')`: Converts HTML content to a PDF document. Returns a Promise resolving with a PDF Buffer. Supports either URL or text input and allows customizing page size.

**Excel Conversion Utilities**
This package provides simple utilities for converting Excel files to JSON and JSON data to Excel files.

Functions

- `ExceltoJSON(type, filepath)`: Converts an Excel file to JSON data. Supports both local files and files stored on Amazon S3. Returns a Promise resolving with an array of objects representing each sheet's data.
- `JSONtoExcel(data)`: Converts JSON data to an Excel file buffer. Returns a Buffer containing the Excel file.

**S3 File Utilities**
This package provides utilities for interacting with files stored on Amazon S3.

Functions

- `s3FileObject(key)`: Retrieves an object from Amazon S3 based on the provided key. Returns a Promise resolving with the file object.
- `s3FileUpload(file, uploadFileDirPath, binaryData, binary = false)`: Uploads a file to Amazon S3. Returns a Promise resolving with the upload data.
- `S3TempAccessUrl(key)`: Generates a temporary access URL for accessing a file on Amazon S3. Returns a Promise resolving with the access URL.

### Api Documentation

The Api documentation can be found using postman collection inside project [[./collections/NODE Starter.postman_collection.json]]
