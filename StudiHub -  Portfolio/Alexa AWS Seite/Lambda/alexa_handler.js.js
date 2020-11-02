'use strict';
/**
 * Anfangsversuche
var http = require('http'); 
var csrf = "";
var cookie =  "";
*/

// --------------- Helpers that build all of the responses -----------------------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Willkommen zu StudiHub. ' +
        'Was wollen sie wissen?';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Wiederholen Sie das bitte.';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Danke das du StudiHub verwendet hatst!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else if (intentName === 'readInfosIntent') {
       callSAPBackend(intent, session, callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};

        function callSAPBackend(intent, session, callback){
            
           var query = intent.slots.QUERY_LIST.resolutions.resolutionsPerAuthority[0].values[0].value.id;
            var sessionAttributes = {};
             httpGetData(query,  (speechOutput) => {
                const output = speechOutput;
                callback(sessionAttributes,
                buildSpeechletResponse(null, output + "Wollen sie noch etwas anderes wissen?", "", false));
                
               //this.listen("Würdest du noch gerne etwas wissen?");
              // this.emit(':responseReady');
                                
                //const speechOutput = theFact;
                //this.response.cardRenderer("StudiHub Read Events", theFact);
                //this.response.speak(speechOutput + " Would you like another fact?").listen("Would you like another fact?");
                //this.emit(':responseReady');
            });
        };
        
        function httpGetData(query, callback){
        const https = require('https');
        var vPath1 = "/sap/opu/odata/swit/studihub_alexa_srv/PostSet?$filter=REQUEST%20eq%20%27";
        var vPath2 = "%27&$format=json";
        var vPath = vPath1.concat(query, vPath2);
        
         var options = {
           host: 'hrdemo.nexus-ag.de',
           path: vPath,
           method: 'GET'
         };
    
        var req = https.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            responseString = configReturnValue(responseString);
            callback(responseString);
        })

    }).on('error', error =>{
              callback(error);
          });
    
    req.end();
        };
        
        function configReturnValue(responseString) {
              var respJSONobj = JSON.parse(responseString);
              var response = respJSONobj.d.results[0].RESPONSE;
              return JSON.stringify(response);
        };
        
        
        
        /**
         * Anfängliche Versuche ----------------------------------------------------------
         */
        
        
        
         function httpGet2(query, callback){
            const http = require('http');
          http.get("http://sapnxswp.nexus-ag.de/sap/opu/odata/swit/studihub_alexa_srv/EventSet?$format=json", (res) => {
              var responseString = '';
              res.setEncoding('utf8');
                  res.on('data', chunk => {
                  responseString = responseString + chunk;
                });
            res.on('end', () => {
                console.log(responseString);
                callback("word");
            });
          }).on('error', error =>{
              callback(error);
          }).end();
          
        };
                    
        
        function httpGet(query, callback){
            var username = 'XXXX';
            var password = 'XXXXXX';
            
            var header = {
                'Authorization': 'Basic '  + new Buffer(username + ':' + password).toString('base64'),
                 "Content-Type":"application/json",
                 "Accept":"application/json",
                 "x-csrf-token":"Fetch",
                 "Connection": "close"
            }
            
           var options = {
           host: 'sapnxswt',
           port: 80,
           path: "/sap/opu/odata/swit/studihub_alexa_srv",
           headers: header,
           method: 'GET',   
           };
           
        var req = http.request(options, res => {
       // res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
           csrf =  res.headers['x-csrf-token'];
           cookie = res.headers['set-cookie'];
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            csrf = res.headers['x-csrf-token'];
            cookie = res.headers['set-cookie'];
            console.log(res.headers['x-csrf-token']);
            //callback(responseString);
        });

    });
    req.end();
    
    var options2 = {
           host: 'sapnxswt',
           port: 80,
           path: "/sap/opu/odata/swit/studihub_alexa_srv",
           headers: header,
           method: 'GET',   
           };
           
    options2.headers['Authorization'] = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
    options2.headers['x-csrf-token'] = csrf;
    options2.method = 'POST';
    options2.path = "/sap/opu/odata/swit/studihub_alexa_srv/EventSet?$format=json";
    options2.headers['Content-Type'] = "application/json";
    options2.headers['Cookie'] = cookie;  
        
        var req_post = http.request(options, res => {
       // res.setEncoding('utf8');
        var responseString = "";
        var resJSON
        //accept incoming data asynchronously
        res.on('data', chunk => {
            resJSON = JSON.parse(chunk);
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            callback(JSON.stringify(resJSON));
        });

    });
    req_post.end();
    
        };
        
            
        
        /** 
         * Test Tutorial 
        */

        function setEventSession(intent, session, callback) {
             let sessionAttributes = {};
             const cardTitle = intent.name;
             let speechOutput = '';
             let repromptText = '';
             const shouldEndSession = false;
             
            // Get the Utterance variables
             const myMaterialSlot = intent.slots.Material;
             
             var username = 'xxxxxxx';
             var password = 'xxxxxxx';
             
             if (myMaterialSlot) {
            
            const myMaterial = myMaterialSlot.value;
             var http = require('http');
            
            
            let headers = {
             'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64'),
             "Content-Type":"application/json",
             "Accept":"application/json",
             "x-csrf-token":"Fetch",
             "Connection": "close"
             };
             
             var opts = {
             hostname: "xxxxxxxx.xxx.xxx",
             port: xxxxx,
             path: "/sap/opu/odata/sap/ZAPPRO_BIN_SRV",
             headers: headers,
             method: 'GET'
             };
             speechOutput = `I have requested a refill of ${myMaterial}.`;
             repromptText = null;
             
             var req = http.request(opts,function(res){
             for(var item in res.headers) {
             console.log(item + ": " + res.headers[item]);
             }
             
             opts.headers['Authorization'] = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
             opts.headers['x-csrf-token'] = res.headers['x-csrf-token'];
             opts.method = 'POST';
             opts.path = "/sap/opu/odata/sap/ZAPPRO_BIN_SRV/TransferOrderSet()";
             opts.headers['Content-Type'] = "application/json";
             opts.headers['Cookie'] = res.headers['set-cookie'];
             var jsonData = '{"Material":"' + myMaterial + '"}';
            
            var req_post = http.request(opts,function(res){
             console.log("POST Response: " + res.statusCode);
             res.on('data', function (chunk) {
             console.log('BODY: ' + chunk);
             var jsonRes = JSON.parse(chunk);
             console.log(jsonRes.d.Material);
             speechOutput = `Okay. ${jsonRes.d.Quantity} ${jsonRes.d.Unit} of ${jsonRes.d.Material} should arrive shortly.`;
             callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
            });
             });
             req_post.write(jsonData);
             req_post.end();
             
             
             });
             req.end();
            
            
            } else {
             speechOutput = "I'm not sure what to refill. Please try again.";
             repromptText = null;
             callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
             }
            };
