(function(w,f,g,e,t,L,u){
"use strict";

const React = t.React;


const Components = f.findByProps(
    "TableSwitchRow",
    "TableRowGroup",
    "Stack",
    "TableRow",
    "TextInput",
    "Text",
    "View"
) || {};


const Text =
Components.Text ||
f.findByProps("Text")?.Text;


const View =
Components.View ||
f.findByProps("View")?.View;


const Stack =
Components.Stack;


const TextInput =
Components.TextInput;


const TableRow =
Components.TableRow;


const TableRowGroup =
Components.TableRowGroup;


const TableSwitchRow =
Components.TableSwitchRow;



const DraftStore = f.findByProps(
    "getDraft",
    "setDraft"
);



const commands = [
    "warn",
    "timeout",
    "jail",
    "kick",
    "ban",
    "mute",
    "unmute",
    "untimeout",
    "unban",
    "unjail"
];


const durations = [
    "15m",
    "30m",
    "1h",
    "3h",
    "6h",
    "12h",
    "1d",
    "7d",
    "30d"
];


const reasons = [
    "Spam",
    "Toxicity",
    "Harassment",
    "Advertising",
    "Politics",
    "Ban Evasion",
    "Custom"
];


const defaults = {

    enabled:true,

    command:"warn",

    user:"",

    duration:"1h",

    reason:"Spam"

};



for(
    const [key,value]
    of Object.entries(defaults)
){

    if(
        L.storage[key] === undefined
    ){

        L.storage[key] = value;

    }

}



let currentChannel = null;



function buildCommand(){

    let command =
    "," + L.storage.command;



    if(
        L.storage.user &&
        L.storage.user.trim()
    ){

        command +=
        " " + L.storage.user.trim();

    }



    if(
        L.storage.command === "timeout"
    ){

        command +=
        " " + L.storage.duration;

    }



    if(
        L.storage.reason &&
        L.storage.reason.trim()
    ){

        command +=
        " " + L.storage.reason;

    }



    return command;

}



function detectCommand(text){

    if(
        !L.storage.enabled
    )
        return;



    if(
        typeof text !== "string"
    )
        return;



    if(
        !text.startsWith(",")
    )
        return;



    const query =
    text
    .slice(1)
    .toLowerCase()
    .trim();



    const match =
    commands.find(
        c =>
        c.startsWith(query)
    );



    if(
        match
    ){

        L.storage.command =
        match;

    }

}

function Settings(){

    L.useProxy(
        L.storage
    );


    const [,update] =
    React.useReducer(
        x=>x+1,
        0
    );


    function setValue(
        key,
        value
    ){

        L.storage[key] =
        value;

        update();

    }



    function insertCommand(){

        if(
            !currentChannel
        ){

            g.showToast(
                "Open a channel first",
                u.getAssetIDByName("Warning")
            );

            return;

        }


        if(
            DraftStore &&
            DraftStore.setDraft
        ){

            DraftStore.setDraft(
                currentChannel,
                buildCommand()
            );

        }


        g.showToast(
            "Command inserted",
            u.getAssetIDByName("Check")
        );

    }



    return React.createElement(
        View,
        {
            style:{
                padding:12
            }
        },



        TableSwitchRow &&
        React.createElement(
            TableSwitchRow,
            {
                label:"Enabled",

                subLabel:
                "Enable moderation command helper",

                value:
                L.storage.enabled,

                onValueChange:
                value=>{

                    setValue(
                        "enabled",
                        value
                    );

                }

            }
        ),




        TableRowGroup &&
        React.createElement(
            TableRowGroup,
            {
                title:"Commands"
            },


            commands.map(
                command=>

                TableRow &&
                React.createElement(
                    TableRow,
                    {
                        key:command,

                        label:
                        "," + command,

                        subLabel:
                        L.storage.command === command
                        ?
                        "Selected"
                        :
                        "",


                        onPress:()=>{

                            setValue(
                                "command",
                                command
                            );

                        }

                    }

                )

            )

        ),





        TableRowGroup &&
        React.createElement(
            TableRowGroup,
            {
                title:"User"
            },


            Stack &&
            TextInput &&
            React.createElement(
                Stack,
                {
                    spacing:8
                },


                React.createElement(
                    TextInput,
                    {
                        placeholder:
                        "@user",

                        value:
                        L.storage.user,


                        onChangeText:
                        value=>{

                            setValue(
                                "user",
                                value
                            );

                        }

                    }

                )

            )

        ),





        TableRowGroup &&
        React.createElement(
            TableRowGroup,
            {
                title:"Duration"
            },


            durations.map(
                duration=>

                TableRow &&
                React.createElement(
                    TableRow,
                    {
                        key:duration,

                        label:
                        duration,

                        subLabel:
                        L.storage.duration === duration
                        ?
                        "Selected"
                        :
                        "",


                        onPress:()=>{

                            setValue(
                                "duration",
                                duration
                            );

                        }

                    }

                )

            )

        ),





        TableRowGroup &&
        React.createElement(
            TableRowGroup,
            {
                title:"Reason"
            },


            reasons.map(
                reason=>

                TableRow &&
                React.createElement(
                    TableRow,
                    {
                        key:reason,

                        label:
                        reason,

                        subLabel:
                        L.storage.reason === reason
                        ?
                        "Selected"
                        :
                        "",


                        onPress:()=>{

                            setValue(
                                "reason",
                                reason
                            );

                        }

                    }

                )

            )

        ),





        TableRowGroup &&
        React.createElement(
            TableRowGroup,
            {
                title:"Preview"
            },


            Text &&
            React.createElement(
                Text,
                {
                    style:{
                        padding:12
                    }
                },

                buildCommand()

            )

        ),




        TableRow &&
        React.createElement(
            TableRow,
            {
                label:
                "Insert Command",

                subLabel:
                "Insert generated command into chat",

                onPress:
                insertCommand

            }

        )

    );

}



const plugin = {

    onLoad(){

        console.log(
            "[ModerationTools] Loaded"
        );


        if(
            DraftStore &&
            DraftStore.setDraft
        ){

            const original =
            DraftStore.setDraft;


            DraftStore.setDraft =
            function(
                channel,
                text
            ){

                currentChannel =
                channel;


                detectCommand(
                    text
                );


                return original.apply(
                    this,
                    arguments
                );

            };

        }

    },

    onUnload(){

        console.log(
            "[ModerationTools] Unloaded"
        );

    },


    settings:
    Settings

};



w.default =
plugin;


Object.defineProperty(
    w,
    "__esModule",
    {
        value:true
    }
);


return w;


})(
{},
vendetta.metro,
vendetta.ui.toasts,
vendetta.plugin,
vendetta.metro.common,
vendetta.storage,
vendetta.ui.assets
);