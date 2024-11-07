import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  useMediaQuery,
  useTheme,
  ListItemButton,
  CssBaseline,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Slide,
  Avatar
} from '@mui/material';
import { 
  Assessment, 
  Menu as MenuIcon, 
  Store, 
  ChevronLeft,
  ChevronRight,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  AccountCircle,
  ExitToApp,
  RequestPage,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Inventory2,
  ListAlt as ListAltIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentNotificationList from './PaymentNotificationList';
import PeopleIcon from '@mui/icons-material/People';
import { Bubble } from "@typebot.io/react";
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useConfig } from '../contexts/ConfigContext';
import ConfigPanel from './ConfigPanel';
const menuItems = [
  { text: 'Meus Serviços', icon: <ListAltIcon />, path: '/services' },
  { text: 'Painel', icon: <HomeIcon />, path: '/' },
  { text: 'Ordens de Serviço', icon: <AssignmentIcon  />, path: '/service-orders' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
  { text: 'Relatórios', icon: <Assessment />, path: '/reports' },
  { text: 'Fornecedores', icon: <Store />, path: '/suppliers' },
  { text: 'Contas a Pagar', icon: <RequestPage />, path: '/accounts-payable' },
  { text: 'Estoque', icon: <Inventory2 />, path: '/stock' },
  
];

// Itens do menu apenas para admin
const adminMenuItems = [
  { 
    text: 'Cadastrar Nichos', 
    icon: <BuildIcon />, 
    path: '/service-types',
    roles: ['admin']
  },
  // ... outros itens admin existentes ...
];

const UserMenu = ({ user, open }) => {
  return (
    <>
      {user?.role === 'admin' && (
        <ListItemButton
          component={Link}
          to="/users"
          sx={{
            minHeight: 48,
            justifyContent: open ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : 'auto',
              justifyContent: 'center',
            }}
          >
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Listar Usuários" 
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
        
      )}
    </>
  );
};

const Layout = ({ toggleTheme, isDarkMode }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const [configOpen, setConfigOpen] = useState(false);
  const { nfeEnabled } = useConfig();

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    if (!isMobile) {
      setOpen(!open);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    setNotificationCount(0);
  };

  const handleCloseNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const drawerWidth = isMobile ? 60 : (open ? 240 : 60);

  const shouldShowBot = () => {
    const allowedPaths = ['/sales', '/products', '/suppliers'];
    return allowedPaths.some(path => location.pathname.startsWith(path));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: theme.palette.primary.main }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Bem vindo, {user?.company?.name}
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => setConfigOpen(true)}
            sx={{ ml: 1 }}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={notificationCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleCloseNotificationMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              style: {
                maxHeight: 400,
                width: '350px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
              },
            }}
          >
            <PaymentNotificationList notifications={notifications} />
          </Menu>
          <IconButton
            onClick={handleMenu}
            color="inherit"
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar 
              src={user?.company?.logo} 
              sx={{ width: 32, height: 32 }}
            >
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
          >
            <MenuItem component={Link} to="/profile">
              <ListItemIcon>
                <Avatar 
                  src={user?.company?.logo}
                  sx={{ width: 24, height: 24 }}
                >
                  <AccountCircle fontSize="small" />
                </Avatar>
              </ListItemIcon>
              Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: 'calc(100% - 64px)'
        }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open && !isMobile ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open && !isMobile ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ opacity: open && !isMobile ? 1 : 0 }}
                />
              </ListItemButton>
            ))}
            {user?.role === 'admin' && (
              <>
                {adminMenuItems.map((item) => (
                  <ListItemButton
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: open && !isMobile ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open && !isMobile ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{ opacity: open && !isMobile ? 1 : 0 }}
                    />
                  </ListItemButton>
                ))}
              </>
            )}
            <UserMenu user={user} open={open} />
          </List>
          {!isMobile && (
            <Box>
              <Divider />
              <IconButton onClick={handleDrawerToggle} sx={{ width: '100%', py: 1 }}>
                {open ? <ChevronLeft /> : <ChevronRight />}
              </IconButton>
            </Box>
          )}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
      {shouldShowBot() && (
        <Bubble
          typebot="my-typebot-qx2vjg5"
          theme={{ 
            button: { 
              backgroundColor: "#0042DA",
                customIconSrc:
                "https://s3.typebot.io/public/workspaces/cm2uwzh4x00014dehrjv0t5s0/typebots/cm2xnsi8s000cd3vaqqx2vjg5/bubble-icon?v=1730407436251",
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 9999
            }
          }}
        />
      )}
      <ConfigPanel
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </Box>
  );
};

export default Layout;
