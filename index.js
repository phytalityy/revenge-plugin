(function(w,f,g,e,t,L,u){
"use strict";

const React = t.React;

const UI = f.findByProps(
    "Text",
    "View",
    "TableRow",
    "TableRowGroup",
    "Stack",
    "TextInput",
    "TableSwitchRow"
) || {};

const Text = UI.Text;
const View = UI.View;
const TableRow = UI.TableRow;
const TableRowGroup = UI.TableRowGroup;
const Stack = UI.Stack;
const TextInput = UI.TextInput;
const TableSwitchRow = UI.TableSwitchRow;

const DraftStore = f.findByProps(
    "getDraft",
    "setDraft"
);


const commands = {
    warn: {
        fields:["user","reason"]
    },

    timeout:{
        fields:["user","duration","reason"]
    },

    jail:{
        fields:["user","duration","reason"]
    },

    kick:{
        fields:["user","reason"]
    },

    ban:{
        fields:["user","reason"]
    },

    mute:{
        fields:["user","reason"]
    },

    unmute:{
        fields:["user"]
    },

    untimeout:{
        fields:["user"]
    },

    unban:{
        fields:["user"]
    },

    unjail:{
        fields:["user"]
    }
};


const durations=[
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


const reasons=[
    "Spam",
    "Toxicity",
    "Harassment",
    "Advertising",
    "Politics",
    "Ban Evasion"
];


const defaults={
    enabled:true,
    command:"warn",
    user:"",
    duration:"1h",
    reason:"Spam"
};


for(
    const [k,v] of Object.entries(defaults)
){

    if(
        L.storage[k] === undefined
    ){

        L.storage[k]=v;

    }

}


let currentChannel=null;


function createCommand(){

    let cmd=
    ","+L.storage.command;


    if(
        L.storage.user
    ){

        cmd+=" "+L.storage.user;

    }


    if(
        L.storage.command==="timeout" ||
        L.storage.command==="jail"
    ){

        cmd+=" "+L.storage.duration;

    }


    if(
        L.storage.reason
    ){

        cmd+=" "+L.storage.reason;

    }


    return cmd;

}



function detectSlash(text){

    if(
        !L.storage.enabled
    )
        return;


    if(
        typeof text!=="string"
    )
        return;


    if(
        !text.startsWith("/")
    )
        return;


    let command =
    text.slice(1)
    .split(" ")[0]
    .toLowerCase();


    if(
        commands[command]
    ){

        L.storage.command=command;

    }

}



function Settings(){

    L.useProxy(
        L.storage
    );


    const [,update]=
    React.useReducer(
        x=>x+1,
        0
    );


    function set(
        key,
        value
    ){

        L.storage[key]=value;

        update();

    }



    function insert(){

        if(
            !currentChannel
        ){

            g.showToast(
                "Open a channel first",
                u.getAssetIDByName("Warning")
            );

            return;

        }


        DraftStore?.setDraft(
            currentChannel,
            createCommand()
        );


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
                label:"Enable Slash Commands",
                value:L.storage.enabled,
                onValueChange:v=>set(
                    "enabled",
                    v
                )
            }
        ),


        TableRowGroup &&
        React.createElement(
            TableRowGroup,
            {
                title:"Commands"
            },


            Object.keys(commands).map(
                command=>

                React.createElement(
                    TableRow,
                    {
                        key:command,

                        label:
                        "/"+command,

                        onPress:()=>set(
                            "command",
                            command
                        )
                    }
                )

            )

        ),


        TextInput &&
        React.createElement(
            TextInput,
            {
                placeholder:"@user",
                value:L.storage.user,
                onChangeText:v=>set(
                    "user",
                    v
                )
            }
        ),


        TextInput &&
        React.createElement(
            TextInput,
            {
                placeholder:"Reason",
                value:L.storage.reason,
                onChangeText:v=>set(
                    "reason",
                    v
                )
            }
        ),


        Text &&
        React.createElement(
            Text,
            null,
            "Preview: "+createCommand()
        ),


        TableRow &&
        React.createElement(
            TableRow,
            {
                label:"Insert Command",
                onPress:insert
            }
        )

    );

}



const plugin={

    onLoad(){

        console.log(
            "[SlashModeration] Loaded"
        );


        if(
            DraftStore?.setDraft
        ){

            const old =
            DraftStore.setDraft;


            DraftStore.setDraft =
            function(
                channel,
                text
            ){

                currentChannel =
                channel;


                detectSlash(
                    text
                );


                return old.apply(
                    this,
                    arguments
                );

            };

        }

    },


    onUnload(){},


    settings:Settings

};



w.default=plugin;


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