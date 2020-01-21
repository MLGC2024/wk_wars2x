--[[-----------------------------------------------------------------------

	Wraith ARS 2X
	Created by WolfKnight

-----------------------------------------------------------------------]]--

resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

name 'Wraith ARS 2X'
description 'An advanced radar system for FiveM'
author 'WolfKnight'
version 'beta3b'

files {
    "nui/radar.html", 
    "nui/radar.css", 
    "nui/jquery-3.4.1.min.js", 
    "nui/radar.js",
    "nui/images/*",
    "nui/fonts/*",
    "nui/sounds/*"
}

ui_page "nui/radar.html"

server_script 'sv_version_check.lua'
server_script 'sv_saving.lua'

client_script 'config.lua'
client_script 'cl_utils.lua'
client_script 'cl_radar.lua'