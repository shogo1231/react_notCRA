import AccountList from '../components/AccountList';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Router = () => {
  return  (
    <BrowserRouter>
      <Routes>
        <Route path="/accountList" element={<AccountList />} />
        <Route path="*" element={ <p>There's nothing here!</p> } />
      </Routes>
    </BrowserRouter>
  )
}

export default Router;