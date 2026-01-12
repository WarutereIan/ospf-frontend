Usage
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

<Sidebar>
  <Menu>
    <SubMenu label="Charts">
      <MenuItem> Pie charts </MenuItem>
      <MenuItem> Line charts </MenuItem>
    </SubMenu>
    <MenuItem> Documentation </MenuItem>
    <MenuItem> Calendar </MenuItem>
  </Menu>
</Sidebar>;
Using React Router
You can make use of the component prop to integrate React Router link

Example Usage

import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';

<Sidebar>
  <Menu
    menuItemStyles={{
      button: {
        // the active class will be added automatically by react router
        // so we can use it to style the active menu item
        [`&.active`]: {
          backgroundColor: '#13395e',
          color: '#b6c8d9',
        },
      },
    }}
  >
    <MenuItem component={<Link to="/documentation" />}> Documentation</MenuItem>
    <MenuItem component={<Link to="/calendar" />}> Calendar</MenuItem>
    <MenuItem component={<Link to="/e-commerce" />}> E-commerce</MenuItem>
  </Menu>
</Sidebar>;
Customization
We provide for each component rootStyles prop that can be used to customize the styles

its recommended using utility classes (sidebarClasses, menuClasses) for selecting target child nodes

Example usage

<Sidebar
  rootStyles={{
    [`.${sidebarClasses.container}`]: {
      backgroundColor: 'red',
    },
  }}
>
  // ...
</Sidebar>
For Menu component, in addition to rootStyles you can also use menuItemStyles prop for customizing all MenuItem & SubMenu components and their children

Type definition

interface MenuItemStyles {
  root?: ElementStyles;
  button?: ElementStyles;
  label?: ElementStyles;
  prefix?: ElementStyles;
  suffix?: ElementStyles;
  icon?: ElementStyles;
  subMenuContent?: ElementStyles;
  SubMenuExpandIcon?: ElementStyles;
}

type ElementStyles = CSSObject | ((params: MenuItemStylesParams) => CSSObject | undefined);
Example usage

<Sidebar>
  <Menu
    menuItemStyles={{
      button: ({ level, active, disabled }) => {
        // only apply styles on first level elements of the tree
        if (level === 0)
          return {
            color: disabled ? '#f5d9ff' : '#d359ff',
            backgroundColor: active ? '#eecef9' : undefined,
          };
      },
    }}
  >
    //...
  </Menu>
</Sidebar>
API
Component	Prop	Type	Description	Default
Sidebar	defaultCollapsed	boolean	Initial collapsed status	false
collapsed	boolean	Sidebar collapsed state	false
toggled	boolean	Sidebar toggled state	false
width	number | string	Width of the sidebar	270px
collapsedWidth	number | string	Width of the sidebar on collapsed state	80px
backgroundColor	string	Set background color for sidebar	rgb(249, 249, 249, 0.7)
image	string	Url of the image to use in the sidebar background, need to apply transparency to background color	-
breakPoint	xs | sm | md | lg | xl | xxl | all	Set when the sidebar should trigger responsiveness behavior	-
customBreakPoint	string	Set custom breakpoint value, this will override breakPoint prop	-
transitionDuration	number	Duration for the transition in milliseconds to be used in collapse and toggle behavior	300
rtl	boolean	RTL direction	false
rootStyles	CSSObject	Apply styles to sidebar element	-
onBackdropClick	() => void	Callback function to be called when backdrop is clicked	-
Menu	closeOnClick	boolean	If true and sidebar is in collapsed state, submenu popper will automatically close on MenuItem click	false
menuItemStyles	MenuItemStyles	Apply styles to MenuItem and SubMenu components and their children	-
renderExpandIcon	(params: { level: number; collapsed: boolean; disabled: boolean; active: boolean; open: boolean; }) => React.ReactNode	Render method for customizing submenu expand icon	-
transitionDuration	number	Transition duration in milliseconds to use when sliding submenu content	300
rootStyles	CSSObject	Apply styles from Menu root element	-
MenuItem	icon	ReactNode	Icon for the menu item	-
active	boolean	If true, the component is active	false
disabled	boolean	If true, the component is disabled	-
prefix	ReactNode	Add a prefix to the menuItem	-
suffix	ReactNode	Add a suffix to the menuItem	-
component	string | ReactElement	A component used for menu button node, can be string (ex: 'div') or a component	-
rootStyles	CSSObject	Apply styles to MenuItem element	-
SubMenu	label	string | ReactNode	Label for the submenu	-
icon	ReactNode	Icon for submenu	-
defaultOpen	boolean	Set if the submenu is open by default	false
open	boolean	Set open value if you want to control the state	-
active	boolean	If true, the component is active	false
disabled	boolean	If true, the component is disabled	-
prefix	ReactNode	Add a prefix to the submenu	-
suffix	ReactNode	Add a suffix to the submenu	-
onOpenChange	(open: boolean) => void	Callback function called when submenu state changes	-
component	string | React.ReactElement	A component used for menu button node, can be string (ex: 'div') or a component	-
rootStyles	CSSObject	Apply styles to SubMenu element	-