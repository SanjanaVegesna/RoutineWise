// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";

// function App() {
//     return ( <
//         Router >
//         <
//         Routes >
//         <
//         Route path = "/"
//         element = { < Login / > }
//         /> <
//         Route path = "/Dashboard"
//         element = { < Dashboard / > }
//         /> < /
//         Routes > <
//         /Router>
//     );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";


function App() {
    return ( <
        Router >
        <
        Routes >
        <
        Route path = "/"
        element = { < Login / > }
        /> <
        Route path = "/dashboard"
        element = { < Dashboard / > }
        /> <
        /Routes> <
        /Router>
    );
}

export default App;