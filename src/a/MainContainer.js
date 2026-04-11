export default function Dashboard () {
    const user = JSON.parse(localStorage.getItem("usr_acc")) || {
        first_name: "Unknown",
        last_name: "User",
        role: "Unknown role"
    };
    return (
        <>logged in<br/> {JSON.stringify(user, null, 2)}</>
    );
}