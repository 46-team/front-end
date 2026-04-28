import {Routes, Route, useNavigate} from 'react-router-dom';
import {useEffect, useState} from "react";
import A_app from "./a/A_app";
import NotFound from "./system-pages/NotFound";

function App() {
    const navigate = useNavigate();
    let curr_version = localStorage.getItem('current_version');

    useEffect(() => {
        if (document.location.pathname == "/") {
            if (!curr_version) {
                curr_version = "a";
                localStorage.setItem('current_version', curr_version);
            }
            navigate(`/${curr_version}`);
        }
    }, []);


    return (
        <>
            <Routes>
                <Route path="/a" element={<A_app/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </>
    );
}

export default App;
