
import * as React from 'react';
import { Flex, Text, Box } from "rebass"
import { Button, Menu, MenuDivider, MenuItem, Popover, Position, InputGroup, Navbar, NavbarGroup, Alignment, Classes } from "@blueprintjs/core";
import { SideMenu } from './SideMenu';
import { Util } from "./utils/util"
import { enc, dec } from "./crypt"
const MarkdownIt = require('markdown-it');
import MdEditor from 'react-markdown-editor-lite'
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import { decEncWebComp } from "./dec-enc"
const customBlock = require('markdown-it-custom-block');


decEncWebComp();
// Initialize a markdown parser
const mdParser = new MarkdownIt()
// Register plugins if required
mdParser.use(customBlock, {
    encr(data: any) {
        return `<enc-tag data="${data}"> </enc-tag>`
    }
});

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const { useEffect, useState, useRef } = React;

export function App(props: any) {

    const [lastIndex, setLastIndex] = useState<any>(null);
    const [fileList, setFileList] = useState<any>([]);
    const [selectedFile, setSelectedFile] = useState({});
    const [mdText, _setMDText] = useState("");
    // Because state not available to window listener
    const mdTextRef = useRef(mdText);
    const setMDText = (data:any) => {
        mdTextRef.current = data;
      _setMDText(data);
    };

    const handleFilterChange = () => {

    }

    const changeSelection = (index: number) => {
        const _fileList = fileList;
        _fileList[index]["selected"] = true;
        if (lastIndex)
            _fileList[lastIndex]["selected"] = false;
        setFileList(_fileList);
        setLastIndex(index);
    }

    const openFile = () => {
        ipcRenderer.send("openFiles");
        ipcRenderer.on("openFiles", (event: any, arg: any) => {
            ipcRenderer.removeAllListeners("openFiles");
            setFileList(arg.fileList);
        });
    }
    const fileItemClick = (index: number, fileItem: any) => {
        changeSelection(index);
        setSelectedFile(fileItem);

        ipcRenderer.send("readFile", fileItem);
        ipcRenderer.on("readFile", (event: any, arg: any) => {
            ipcRenderer.removeAllListeners("readFile");
            console.log("arg", arg);
            const _fileData = Util.isSet(() => arg.data, "");
            setMDText(_fileData);
        });
    }

    useEffect(() => {
        ipcRenderer.on("dbFileList", (event: any, arg: any) => {
            ipcRenderer.removeAllListeners("dbFileList");
            const _fileList = Util.isSet(() => arg.data, []);
            console.log("dbFileList", _fileList);
            setFileList(_fileList)
        })

        window.addEventListener("decenc", (evt: any) => {
            console.log("evt.detail", evt.detail);
            decryptEncrypt(evt.detail)
        });

    }, []);

    const decryptEncrypt = (detail: any) => {
        const data = Util.isSet(() => detail.data, "");
        const mode = Util.isSet(() => detail.mode, false);
        if (data) {
            if (mode) {
                // decrypt
                const decData = dec(data, "1234");
                let _fileData = mdTextRef.current;
                _fileData = _fileData.replace(`@[encr](${data}|${mode})`, `@[encr](${decData}|false)`);
                setMDText(_fileData);
            } else {
                // encrypt
                const encData = enc(data, "1234");
                let _fileData = mdTextRef.current;
                _fileData = _fileData.replace(`@[encr](${data}|${mode})`, `@[encr](${encData}|true)`);
                setMDText(_fileData);
            }
        }
    }

    const handleEditorChange = ({ html, text }: { html: any, text: any }) => {
        console.log('handleEditorChange', text)
        const _mdText = text;
        setMDText(_mdText)
    }

    const saveFile = () => {
        ipcRenderer.send("saveFile", { selectedFile,fileData:mdText });
    }

    const mainMenu = (
        <Menu>
            <MenuItem icon="document" text="New File" />
            <MenuItem icon="folder-open" text="Open Folder" onClick={openFile} />
            <MenuItem icon="saved" text="Save" onClick={saveFile} />
            <MenuItem icon="upload" text="Sync" shouldDismissPopover={false} />
            <MenuItem icon="zoom-to-fit" text="Nucleus" disabled={true} />
            <MenuDivider />
            <MenuItem icon="cog" text="Settings...">
                <MenuItem icon="add" text="Add new application" disabled={true} />
                <MenuItem icon="remove" text="Remove application" />
            </MenuItem>
        </Menu>
    );

    return (
        <div className='app' style={{ margin: "0 5px" }}>

            <Flex flexWrap='wrap' mx={-2}>

                <Box width={1}>
                    <Navbar className="nav-bar">
                        <NavbarGroup align={Alignment.LEFT}>
                            <Popover content={mainMenu} position={Position.BOTTOM}>
                                <Button className={Classes.MINIMAL} icon="menu" text="Menu" />
                            </Popover>
                        </NavbarGroup>
                    </Navbar>
                </Box>

                <Box width={"25%"}>
                    <div className="search-input-container" >
                        <InputGroup
                            style={{ height: "28px" }}
                            disabled={false}
                            leftIcon="search"
                            onChange={handleFilterChange}
                            placeholder="Search..."
                            small={true}
                            type="search"
                            value={""}
                        />
                    </div>
                    <div className="sidemenu-container">
                        <SideMenu fileList={fileList} onFileClick={fileItemClick} />
                    </div>
                </Box>
                <Box width={"75%"}>
                    <MdEditor
                        value={mdText}
                        style={{ height: "100%", minHeight: "600px" }}
                        view={{ menu: true, md: false, html: true }}
                        renderHTML={(text) => mdParser.render(text)}
                        onChange={handleEditorChange}
                    />
                </Box>
            </Flex>
        </div>
    )

}