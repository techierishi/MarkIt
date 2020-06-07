
import * as React from 'react';
import { IResizeEntry, ResizeSensor, Icon, Tag, Menu, MenuDivider, MenuItem, Position, Popover, Classes, Button, Alert, Intent, Toaster, } from '@blueprintjs/core';

const { useRef, useState } = React;

export function SideMenu(props: any) {

    const [isOpen, setIsOpen] = useState(false);
    const toastRef = useRef(null);

    const handleResize = (entries: IResizeEntry[]) => {
        console.log("handleResize", entries.map(e => `${e.contentRect.width} x ${e.contentRect.height}`));
    }

    const handleMoveConfirm = () => {
        setIsOpen(false);
        const mRef: any = toastRef.current;
        mRef.show({ className: "toast-", message: TOAST_MESSAGE });
    };
    const handleMoveCancel = () => setIsOpen(false);
    const handleMoveOpen = () => setIsOpen(true);

    const TOAST_MESSAGE = (
        <div>
            <strong>filename</strong> was moved to Trash
        </div>
    );

    const fileMenu = (
        <Menu>
            <MenuItem icon="document" text="Delete" onClick={handleMoveOpen} />
            <MenuItem icon="document" text="Encrypt" />
        </Menu>
    );


    const onFileClick = (index:any, item: any) =>{
        props.onFileClick(index, item)
    }

    return (
        <React.Fragment>
            <ResizeSensor onResize={handleResize}>
                <div style={{ width: "100%" }} >
                    {props.fileList && props.fileList.map((item: any, index: any) => {
                        return <div key={index} className={`${(item.selected)? "emenu-item selected" : "emenu-item"}`} onClick={() => onFileClick(index,item)}>
                            <div className="emenu-item-heading">
                                <div className="emenu-item-heading-title" >
                                    {item.name}
                                </div>
                                <div className="emenu-item-heading-options" >
                                    <Popover content={fileMenu} position={Position.BOTTOM}>
                                        <Button className={Classes.MINIMAL} icon="more" />
                                    </Popover>


                                </div>
                            </div>
                            <div className="emenu-item-descr"> {item.descr} </div>
                            <div className="emenu-item-labels">
                                <Tag>
                                    tag
                            </Tag>
                            </div>
                        </div>
                    })}
                </div>
            </ResizeSensor>

            <Alert
                className="alert-cancel"
                cancelButtonText="Cancel"
                confirmButtonText="Move to Trash"
                icon="trash"
                intent={Intent.DANGER}
                isOpen={isOpen}
                onCancel={handleMoveCancel}
                onConfirm={handleMoveConfirm}
            >
                <p>
                    Are you sure you want to move <b>filename</b> to Trash? You will be able to restore it later,but it will become private to you.
                </p>
            </Alert>
            <Toaster ref={toastRef} />
        </React.Fragment>
    )
}