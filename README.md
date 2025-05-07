# Prerequisites

Android Studio is needed to run this: https://developer.android.com/studio?gad_source=1&gad_campaignid=22447855674&gbraid=0AAAAAC-IOZmB7yijNEZN31oquGkSDw6gq&gclid=Cj0KCQjw5ubABhDIARIsAHMighaGsUQN7V5JR4ZRhCVB0sdXazFlKZGNPmITFRSekDksT4YXSmoKK2saAhJ5EALw_wcB&gclsrc=aw.ds

Node.js is also required to run this:

https://nodejs.org/en/

Java is also required to run this, make sure you have a JDK version 17 or higher and under 25.

https://www.oracle.com/java/technologies/downloads/

## How to Run

Download the folder from GitHub and unzip it.

Open the folder in Android Studio. When you press Open, you should select the directory the folder is in.

In the terminal, enter the command:

```bash
npm install expo
```
to download expo.

Then enter the command:

```bash
npm run android
```
### Errors

There could be some errors. Delete the android folder and run npm run android again. If that doesn't work, make sure your environment variables are set correctly. You should have a user variable for ANDROID_HOME, usually set to C:\Users\USERNAME\AppData\Local\Android\Sdk

And another system variable for JAVA_HOME that should direct to where your JDK files are downloaded.

