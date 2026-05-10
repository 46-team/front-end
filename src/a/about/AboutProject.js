import {
    Box,
    Chip,
    Divider,
    Link,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GroupsIcon from "@mui/icons-material/Groups";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const TEAM_MEMBERS = [
    {
        name: "Igor Balytskyi",
        role: "Computer Science teacher, team supervisor, backend developer",
        email: "bal@46.ukr.education",
    },
    {
        name: "Pavlo Postolnyi",
        role: "10-M grade student, team captain, project architect, team lead, frontend developer and cryptographic library developer",
    },
    {
        name: "Roman Medvedev",
        role: "9-A grade student, backend developer",
        phone: "+380660235286",
        email: "cattemeo@gmail.com",
    },
    {
        name: "Glib Plis",
        role: "9-M-2 grade student, project coordinator and tester",
        phone: "+380662104658",
        email: "plgl9394@gmail.com",
    },
    {
        name: "Terrance Shumov",
        role: "8-A grade student, frontend developer, designer",
        phone: "+380992346612",
        email: "kentaky134@gmail.com",
    },
];

function ContactLine({icon, label, href}) {
    return (
        <Link
            href={href}
            underline="hover"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                color: "text.secondary",
                fontSize: "0.875rem",
                fontWeight: 600,
                minWidth: 0,
                wordBreak: "break-word",
            }}
        >
            {icon}
            {label}
        </Link>
    );
}

function TeamMemberCard({member}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: {xs: 2, sm: 2.5},
                borderRadius: 1,
                height: "100%",
            }}
        >
            <Stack spacing={1.25} sx={{height: "100%"}}>
                <Box sx={{minWidth: 0}}>
                    <Typography variant="h6" component="h3" sx={{fontWeight: 800, wordBreak: "break-word"}}>
                        {member.name}
                    </Typography>
                    <Typography variant="body2" sx={{mt: 0.5, color: "text.secondary", wordBreak: "break-word"}}>
                        {member.role}
                    </Typography>
                </Box>

                {(member.email || member.phone) && (
                    <Stack spacing={0.75} sx={{mt: "auto"}}>
                        {member.email && (
                            <ContactLine
                                icon={<EmailIcon fontSize="inherit"/>}
                                label={member.email}
                                href={`mailto:${member.email}`}
                            />
                        )}
                        {member.phone && (
                            <ContactLine
                                icon={<PhoneIcon fontSize="inherit"/>}
                                label={member.phone}
                                href={`tel:${member.phone}`}
                            />
                        )}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}

export default function AboutProject() {
    return (
        <Stack spacing={3}>
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={3}>
                    <Box
                        sx={{
                            maxWidth: 760,
                            minWidth: 0,
                        }}
                    >
                        <Chip
                            icon={<WorkspacePremiumIcon/>}
                            label="Star for Life Ukraine competition"
                            sx={{borderRadius: 1, mb: 2, maxWidth: "100%"}}
                        />
                        <Typography variant="h5" component="h2" sx={{fontWeight: 800}}>
                            About the project
                        </Typography>
                        <Typography sx={{mt: 1.25, color: "text.secondary", fontSize: "1rem"}}>
                            The project was developed as part of the{" "}
                            <Link href="https://www.sflua.org/uk" target="_blank" rel="noopener noreferrer">
                                Star for Life Ukraine competition
                            </Link>{" "}
                            by the team of{" "}
                            <Link href="http://www.gymnasium46.edu.kh.ua" target="_blank" rel="noopener noreferrer">
                                Kharkiv Lyceum No. 46
                            </Link>
                            .
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={2.5}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <GroupsIcon color="primary"/>
                            <Typography variant="h5" component="h2" sx={{fontWeight: 800}}>
                                Project team
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{mt: 0.75, color: "text.secondary"}}>
                            Team members and responsibilities.
                        </Typography>
                    </Box>

                    <Divider/>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                            },
                            gap: 2,
                        }}
                    >
                        {TEAM_MEMBERS.map(member => (
                            <TeamMemberCard key={member.name} member={member}/>
                        ))}
                    </Box>
                </Stack>
            </Paper>
        </Stack>
    );
}
