import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components';
import { 
  Landing,
  Login, 
  Register, 
  Profile, 
  Posts,
  News, 
  CreateTrainingSession,
  MyTrainingSessions,
  TrainingSessionDetails,
  AvailableTrainingSessions,
  MyEnrollments,
  AdminCreatePost,
  AdminManageUsers
} from './pages';
import { ExerciseConstructor } from './pages/ExerciseConstructor';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exerciseConstructor" element={<ExerciseConstructor/>}/>
          <Route
            path="/create-training-session"
            element={
              <ProtectedRoute>
                <CreateTrainingSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-training-sessions"
            element={
              <ProtectedRoute>
                <MyTrainingSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/available-training-sessions"
            element={
              <ProtectedRoute>
                <AvailableTrainingSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-enrollments"
            element={
              <ProtectedRoute>
                <MyEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-session/:id"
            element={
              <ProtectedRoute>
                <TrainingSessionDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
            <Route path="/posts">
                <Route index element={<Posts />} />
                <Route path=":id" element={<Posts />} />
            </Route>
            <Route path="/news" element={<News />} />
            <Route
              path="/admin/create-post"
              element={
                <ProtectedRoute>
                  <AdminCreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-users"
              element={
                <ProtectedRoute>
                  <AdminManageUsers />
                </ProtectedRoute>
              }
            />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
