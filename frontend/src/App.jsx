import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Order from './pages/Order';
import Reservation from './pages/Reservation';
import AddNewCategory from './pages/AddNewCategory';
import AddMenuItem from './pages/AddMenuItem';
import Profile from './pages/Profile';
import Menu from './pages/Menu';
import Notification from './pages/Notification';
import Table from './pages/Table';
import Settings from './pages/Settings';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { setNavigate } from './utils/navigation';

function App() {
  const navigate = useNavigate();

  // Initialize navigation utility for API layer
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2a2a2a',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Layout>
                <Menu />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Layout>
                <Staff />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Layout>
                <Order />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/table"
          element={
            <ProtectedRoute>
              <Layout>
                <Table />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservation"
          element={
            <ProtectedRoute>
              <Layout>
                <Reservation />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addnewcategory"
          element={
            <ProtectedRoute>
              <Layout>
                <AddNewCategory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addmenuitem"
          element={
            <ProtectedRoute>
              <Layout>
                <AddMenuItem />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <Layout>
                <Notification />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

// import { Routes, Route, useLocation } from "react-router-dom";
// import { AnimatePresence, motion } from "framer-motion";

// import Login from "./pages/Login";
// import ForgotPassword from "./pages/ForgotPassword";
// import Dashboard from "./pages/Dashboard";
// import Inventory from "./pages/Inventory";
// import Staff from "./pages/Staff";
// import Order from "./pages/Order";
// import Reservation from "./pages/Reservation";
// import Reports from "./pages/Reports";
// import AddNewCategory from "./pages/AddNewCategory";
// import AddMenuItem from "./pages/AddMenuItem";
// import Profile from "./pages/Profile";
// import Menu from "./pages/Menu";
// import Notification from "./pages/Notification";

// /* Page animation wrapper */
// const PageWrapper = ({ children }) => (
//   <motion.div
//     initial={{ filter: "blur(8px)" }}
//     animate={{ filter: "blur(0px)" }}
//     exit={{ filter: "blur(8px)" }}
//     transition={{ duration: 0.25 }}
//     className="h-full"
//   >
//     {children}
//   </motion.div>
// );

// function App() {
//   const location = useLocation();

//   return (
//     <AnimatePresence mode="wait">
//       <Routes location={location} key={location.pathname}>
//         <Route
//           path="/"
//           element={
//             <PageWrapper>
//               <Login />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/forgot-password"
//           element={
//             <PageWrapper>
//               <ForgotPassword />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/dashboard"
//           element={
//             <PageWrapper>
//               <Dashboard />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/menu"
//           element={
//             <PageWrapper>
//               <Menu />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/inventory"
//           element={
//             <PageWrapper>
//               <Inventory />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/staff"
//           element={
//             <PageWrapper>
//               <Staff />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/order"
//           element={
//             <PageWrapper>
//               <Order />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/reservation"
//           element={
//             <PageWrapper>
//               <Reservation />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/reports"
//           element={
//             <PageWrapper>
//               <Reports />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <PageWrapper>
//               <Profile />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/addnewcategory"
//           element={
//             <PageWrapper>
//               <AddNewCategory />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/addmenuitem"
//           element={
//             <PageWrapper>
//               <AddMenuItem />
//             </PageWrapper>
//           }
//         />

//         <Route
//           path="/notification"
//           element={
//             <PageWrapper>
//               <Notification />
//             </PageWrapper>
//           }
//         />
//       </Routes>
//     </AnimatePresence>
//   );
// }

// export default App;
