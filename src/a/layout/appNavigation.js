import DashboardIcon from "@mui/icons-material/Dashboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import GavelIcon from "@mui/icons-material/Gavel";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";

export const NAV_ITEMS = [
    {
        id: "overview",
        label: "Overview",
        icon: DashboardIcon,
        roles: ["admin", "team", "jury", "organizer"],
    },
    {
        id: "tournaments",
        label: "Tournaments",
        icon: EmojiEventsIcon,
        roles: ["admin", "team", "jury", "organizer"],
    },
    {
        id: "team",
        label: "Team",
        icon: GroupsIcon,
        roles: ["team"],
    },
    {
        id: "judging",
        label: "Judging",
        icon: GavelIcon,
        roles: ["jury"],
    },
    {
        id: "organizer",
        label: "Organizer",
        icon: SettingsSuggestIcon,
        roles: ["organizer"],
    },
    {
        id: "role-management",
        label: "Roles",
        icon: ManageAccountsIcon,
        roles: ["admin"],
    },
];

export function getNavigationForRole(role) {
    return NAV_ITEMS.filter(item => item.roles.includes(role));
}
