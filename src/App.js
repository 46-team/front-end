import {Routes, Route} from 'react-router-dom';
import A_app from "./a/A_app";
import NotFound from "./system-pages/NotFound";

function App() {
    return (
        <>
            <Routes>
                <Route path="/*" element={<A_app/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </>
    );
}

export default App;
