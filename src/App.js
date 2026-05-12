import {Routes, Route} from 'react-router-dom';
import AApp from "./a/A_app";
import NotFound from "./system-pages/NotFound";

function App() {
    return (
        <>
            <Routes>
                <Route path="/*" element={<AApp/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </>
    );
}

export default App;
