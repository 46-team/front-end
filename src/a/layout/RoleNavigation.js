import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import {getNavigationForRole} from "./appNavigation";
import {normalizeRole} from "./userUtils";

export default function RoleNavigation({role, activeItem, onNavigate, inverse = false}) {
    const normalizedRole = normalizeRole(role);
    const items = getNavigationForRole(normalizedRole);
    const overlineColor = inverse ? "rgba(255, 255, 255, 0.82)" : "text.secondary";

    return (
        <Box>
            <Typography variant="overline" sx={{px: 2, color: overlineColor, fontWeight: 700}}>
                Navigation
            </Typography>
            <List sx={{pt: 0.5}}>
                {items.map(item => {
                    const Icon = item.icon;
                    const isSelected = activeItem === item.id;

                    return (
                        <ListItemButton
                            key={item.id}
                            selected={isSelected}
                            onClick={() => onNavigate(item.id)}
                            sx={{mx: 1}}
                        >
                            <ListItemIcon sx={{minWidth: 38}}>
                                <Icon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText primary={item.label}/>
                        </ListItemButton>
                    );
                })}
            </List>
            <Divider sx={{mx: 2, mt: 1}}/>
        </Box>
    );
}
