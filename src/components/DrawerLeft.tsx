import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {ApiType, LoginType, SpaceType} from '../lib/interface/local'
import {useEffect, useState} from "react";
import {globalStorage} from "../lib/storage/storage";
import Modal from "@mui/material/Modal";
import ApiLogin from "./ApiLogin";
import ApiSetting from "./ApiSetting";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import {DialogActions, DialogContent} from "@mui/material";
import {TableDataType, TableRowsType} from "../lib/interface/api";
import {errorNotice, successNotice} from "./notice";
import {getTableRequest, postTableRequest} from "../lib/api/api";
import {addLoading, delLoading} from "./loading";

const drawerWidth = 300;

interface ApiLoginType {
  open: boolean
  spaceID: number
}
interface ApiSettingType{
  open: boolean
  spaceID: number
  apiID?: number
}

interface Props {
  tableDataHandler: (data: TableDataType) => void
  tableRowsData: TableRowsType
}
export default function Index({ tableDataHandler, tableRowsData }: Props) {
  const apiLoginInit = {open: false, spaceID: 0}
  const apiSettingInit = {open: false, spaceID: 0}
  const [apiLogin, setApiLogin] = useState<ApiLoginType>(apiLoginInit);
  const [apiSetting, setApiSetting] = useState<ApiSettingType>(apiSettingInit);
  const [spaceList, setSpaceList] = useState<SpaceType[]>()
  const [spaceName, setSpaceName] = useState('')
  const [spaceNameOpen, setSpaceNameOpen] = useState(false)
  useEffect(() => {
    let data = globalStorage.get<SpaceType[]>('spaceList')
    if(data === null) {
      data = [{
        name: '????????????',
        login: {
          url: '/login',
          account: 'pyf',
          token: 'json web token'
        },
        apiList: [{
            url: '/table',
            method: 'GET',
            description: '????????????mock??????',
          },{
            url: '/table',
            method: 'POST',
            description: '????????????mock??????',
          },
        ]
      }, {
        name: '??????2',
        login: {
          url: '',
          account: '',
          token: ''
        },
        apiList: []
      }
      ];
    }
    setSpaceList(data)
  }, [])

  useEffect(() => {
    if(spaceList) {
      globalStorage.set('spaceList', spaceList)
    }
  }, [spaceList])

  const handleOpenApiLogin = (spaceID: number) => {
    setApiLogin({open: true, spaceID: spaceID});
  }
  const handleCloseApiLogin = () => setApiLogin(apiLoginInit);
  const handleOpenApiSetting = (spaceID: number, apiID?: number) => {
    setApiSetting({open: true, spaceID: spaceID, apiID: apiID})
  }
  const handleCloseApiSetting = () => setApiSetting(apiSettingInit);

  const onApiLoginSpaceChange = (data: SpaceType[]) => {
    setSpaceList(data)
    setApiLogin(apiLoginInit)
  }
  const onApiSettingSpaceChange = (data: SpaceType[]) => {
    setSpaceList(data)
    setApiSetting(apiSettingInit)
  }
  const onSpaceNameChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSpaceName(event.target.value)
  }
  const onSpaceNameSubmit = () => {
    if(spaceList === undefined) return
    const newData = [...spaceList]
    newData.push({
      name: spaceName,
      login: {
        url: '',
        account: '',
        token: ''
      },
      apiList: []
    })
    setSpaceList(newData)
    setSpaceNameOpen(false)
  }

  const handleSend = async (spaceID: number, apiID: number) => {
    addLoading()
    await apiRequest(spaceID, apiID)
    delLoading()
  }
  const apiRequest = async (spaceID: number, apiID: number) => {
    if(spaceList === undefined) return
    try {
      if(spaceList === null
        || spaceList.length - 1 < spaceID
        || spaceList[spaceID].apiList.length - 1 < apiID) {
        throw '???????????????'
      }
      const login = spaceList[spaceID].login
      const api = spaceList[spaceID].apiList[apiID]
      if(api.method === 'GET') {
        if(!confirm('??????GET??????????????????????????????????????????????????????')) return
        const tableData = await getTableRequest({
          url: api.url,
          token: login.token
        })
        tableDataHandler(tableData)
        successNotice('????????????')
      } else {
        if(!confirm('POST??????????????????????????????????????????')) return
        await postTableRequest({
          url: api.url,
          token: login.token,
          data: {
            table: tableRowsData
          }
        })
        successNotice('????????????')
      }
    } catch (err) {
      errorNotice(err as string)
    }
  }

  return (
    <>
      <Modal
        open={apiLogin.open}
        onClose={handleCloseApiLogin}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ApiLogin spaceID={apiLogin.spaceID} spaceList={spaceList}
                  onSpaceChange={onApiLoginSpaceChange}/>
      </Modal>
      <Modal
        open={apiSetting.open}
        onClose={handleCloseApiSetting}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ApiSetting spaceID={apiSetting.spaceID} apiID={apiSetting.apiID} spaceList={spaceList}
                    onSpaceChange={onApiSettingSpaceChange}/>
      </Modal>
      <Dialog open={spaceNameOpen} onClose={() => setSpaceNameOpen(false)}>
        <DialogContent>
          <TextField
            margin="normal"
            required
            name="name"
            label="????????????"
            id="name"
            value={spaceName}
            onChange={onSpaceNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onSpaceNameSubmit}>??????</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />
          {/* ?????????????????? */}
          {
            <List
              sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
              component="nav"
              aria-labelledby="nested-list-subheader"
            >
              {spaceList &&
                spaceList.map((item, index) => (
                  <Space spaceID={index} key={index} {...item} handleSend={handleSend}
                         handleLogin={handleOpenApiLogin} handleApiSetting={handleOpenApiSetting}/>
                ))
              }
            </List>
          }
          <ListItem>
            <ListItemText primary="?????????" />
            <Button variant="outlined" size="small" onClick={() => setSpaceNameOpen(true)}>
              ??????
            </Button>
          </ListItem>
        </Drawer>
      </Box>
    </>
  );
}

interface SpaceProps extends SpaceType {
  spaceID: number
  handleLogin: (spaceID: number) => void
  handleApiSetting: (spaceID: number, apiID?: number) => void
  handleSend: (spaceID: number, apiID: number) => void
}
function Space(props: SpaceProps) {
  const [open, setOpen] = React.useState(true);
  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <div>
      <ListItemButton onClick={handleClick}>
        <ListItemText primary={props.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Divider variant="middle" component="li" />
        <List sx={{ pl: 3 }} component="div" disablePadding>
          <LoginItem {...props.login} handleLogin={props.handleLogin} spaceID={props.spaceID}/>
          {
                props.apiList.map((item, index) => (
                  <Ports spaceID={props.spaceID} apiID={index} key={index} {...item}
                         handleApiSetting={props.handleApiSetting} handleSend={props.handleSend}/>
                ))
              }
          <ListItem>
            <Button sx={{ mx: 'auto', fontSize: 10 }} variant="outlined" size="small"
                    onClick={() => props.handleApiSetting(props.spaceID)}>
              ????????????
            </Button>
          </ListItem>
        </List>
      </Collapse>
      <Divider />
    </div>
  );
}

interface LoginItemProps extends LoginType {
  spaceID: number
  handleLogin: (spaceID: number) => void
}
function LoginItem(props: LoginItemProps) {
  if (props.token !== '') {
    return (
      <div>
        <ListItem>
          <ListItemText primary="?????????" />
          <Button sx={{fontSize: 10}} variant="outlined" size="small" onClick={() => props.handleLogin(props.spaceID)}>
            ??????
          </Button>
        </ListItem>
        <Divider variant="middle" component="li" />
      </div>
    );
  }
  return (
    <div>
      <ListItem>
        <ListItemText primary="?????????" />
        <Button variant="outlined" size="small" onClick={() => props.handleLogin(props.spaceID)}>
          ??????
        </Button>
      </ListItem>
      <Divider variant="middle" component="li" />
    </div>
  );
}

interface PortsProps extends ApiType {
  spaceID: number
  apiID: number
  handleApiSetting: (spaceID: number, apiID: number) => void
  handleSend: (spaceID: number, apiID: number) => void
}
function Ports(props: PortsProps) {
  const onSend = () => {
    props.handleSend(props.spaceID, props.apiID)
  }
  return (
    <div>
      <ListItem>
        <span  style={{fontSize: 12, flex: 1}}>{props.description}</span>
        <Button size="small"
                onClick={() => props.handleApiSetting(props.spaceID, props.apiID)}>
          ??????
        </Button>
        <Button variant="contained" size="small" onClick={onSend}>??????</Button>
      </ListItem>
      <Divider variant="middle" component="li" />
    </div>
  );
}