
import * as React from 'react';
import { Flex, Text, Box } from "rebass"
import { Button, Menu, MenuDivider, MenuItem, Popover, Position, InputGroup, Navbar, NavbarGroup, Alignment, Classes } from "@blueprintjs/core";
import { SideMenu } from './SideMenu';
const MarkdownIt = require('markdown-it');
import MdEditor from 'react-markdown-editor-lite'
// import style manually
import 'react-markdown-editor-lite/lib/index.css';

// Register plugins if required
// MdEditor.use(YOUR_PLUGINS_HERE);

// Initialize a markdown parser
const mdParser = new MarkdownIt

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const { useEffect, useState } = React;

export function App(props: any) {

    let fileData: string = ""
    const [lastIndex, setLastIndex] = useState<any>(null);
    const [fileList, setFileList] = useState<any>([]);
    const [selectedFile, setSelectedFile] = useState({});
    const [mdText, setMDText] = useState("");

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
            setMDText(arg.data);
        });
    }

    useEffect(() => {
        ipcRenderer.on("dbFileList", (event: any, arg: any) => {
            ipcRenderer.removeAllListeners("dbFileList");
            console.log("dbFileList", arg.data);
            setFileList(arg.data)
        })

    }, []);

    const handleEditorChange = ({ html, text }: { html: any, text: any }) => {
        console.log('handleEditorChange', text)
        fileData = text;
    }

    const saveFile = () => {
        ipcRenderer.send("saveFile", { selectedFile, fileData });
    }

    const mainMenu = (
        <Menu>
            <MenuItem icon="document" text="New File" />
            <MenuItem icon="document" text="Open" onClick={openFile} />
            <MenuItem icon="document" text="Save" onClick={saveFile} />
            <MenuItem icon="document" text="Save All" shouldDismissPopover={false} />
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
                                <Button className={Classes.MINIMAL} icon="document" text="Files" />
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