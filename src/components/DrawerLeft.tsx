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
import Chip from '@mui/material/Chip';
import {ApiType, LoginType, SpaceType} from '../lib/interface/local'
import {useEffect, useState} from "react";
import {globalStorage} from "../lib/storage/storage";
import Modal from "@mui/material/Modal";
import ApiLogin from "../pages/api/Login";
import ApiSetting from "../pages/api/ApiSetting";

const drawerWidth = 300;

interface ApiLoginType {
  open: boolean
  spaceID: number
}
interface ApiSetting {
  open: boolean
  spaceID: number
  apiID: number
}
export default function DrawerLeft() {
  const apiLoginInit = {open: false, spaceID: 0}
  const apiSettingInit = {open: false, spaceID: 0, apiID: 0}
  const [apiLogin, setApiLogin] = useState<ApiLoginType>(apiLoginInit);
  const [apiSetting, setApiSetting] = useState<ApiSetting>(apiSettingInit);
  const [spaceList, setSpaceList] = useState<SpaceType[]>()
  useEffect(() => {
    let data = globalStorage.get<SpaceType[]>('spaceList')
    if(data === null) {
      data = [{
        name: '空间1',
        login: {
          url: '1',
          account: '1',
          token: '1'
        },
        apiList: [{
          url: '2',
          method: 'GET',
          description: '接口1',
        }
        ]
      }, {
        name: '空间2',
        login: {
          url: '',
          account: '',
          token: ''
        },
        apiList: []
      }
      ];
      globalStorage.set('spaceList', data)
    }
    setSpaceList(data)
  }, [])

  const handleOpenApiLogin = (spaceID: number) => {
    setApiLogin({open: true, spaceID: spaceID});
  }
  const handleCloseApiLogin = () => setApiLogin(apiLoginInit);
  const handleOpenApiSetting = (spaceID: number, apiID: number) => {
    setApiSetting({open: true, spaceID: spaceID, apiID: apiID})
  }
  const handleCloseApiSetting = () => setApiSetting(apiSettingInit);

  return (
    <>
      <Modal
        open={apiLogin.open}
        onClose={handleCloseApiLogin}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ApiLogin />
      </Modal>
      <Modal
        open={apiSetting.open}
        onClose={handleCloseApiSetting}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ApiSetting />
      </Modal>
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
          {/* 空间折叠列表 */}
          { spaceList &&
            <NestedItem spaceList={spaceList}
                        handleLogin={handleOpenApiLogin} handleApiSetting={handleOpenApiSetting}/> }
          <AddSpace />
        </Drawer>
      </Box>
    </>
  );
}

interface NestedItemProps {
  spaceList: SpaceType[]
  handleLogin: (spaceID: number) => void
  handleApiSetting: (spaceID: number, apiID: number) => void
}
function NestedItem(props: NestedItemProps) {
  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {
        props.spaceList.map((item, index) => (
          <Space spaceID={index} key={index} {...item}
                 handleLogin={props.handleLogin} handleApiSetting={props.handleApiSetting}/>
        ))
      }
    </List>
  );
}

interface SpaceProps extends SpaceType {
  spaceID: number
  handleLogin: (spaceID: number) => void
  handleApiSetting: (spaceID: number, apiID: number) => void
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
          <LoginState {...props.login} />
          {
                props.apiList.map((item, index) => (
                  <Ports spaceID={props.spaceID} apiID={index} key={index} {...item}
                         handleApiSetting={props.handleApiSetting}/>
                ))
              }
          <ListItem>
            <Button sx={{ mx: 'auto' }} variant="outlined" size="small">添加接口</Button>
          </ListItem>
        </List>
      </Collapse>
      <Divider />
    </div>
  );
}

function LoginState(props: LoginType) {
  if (props.token !== '') {
    return (
      <div>
        <ListItem>
          <ListItemText primary="已登录" />
          <Button variant="outlined" size="small">切换</Button>
        </ListItem>
        <Divider variant="middle" component="li" />
      </div>
    );
  }
  return (
    <div>
      <ListItem>
        <ListItemText primary="未登录" />
        <Button variant="contained" size="small">登录</Button>
      </ListItem>
      <Divider variant="middle" component="li" />
    </div>
  );
}

interface Props extends ApiType {
  spaceID: number
  apiID: number
  handleApiSetting: (spaceID: number, apiID: number) => void
}
function Ports(props: Props) {
  return (
    <div>
      <ListItem>
        <Chip label={props.method} color="primary" size="small" />
        <ListItemText primary={props.description} />
        <Button size="small">修改</Button>
        <Button variant="contained" size="small">发送</Button>
      </ListItem>
      <Divider variant="middle" component="li" />
    </div>
  );
}

function AddSpace() {
  return (
    <ListItem>
      <ListItemText primary="新空间" />
      <Button variant="outlined" size="small">添加</Button>
    </ListItem>
  );
}
