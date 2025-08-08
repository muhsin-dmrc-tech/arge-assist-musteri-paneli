import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorsLayout } from '@/layouts/errors';
import { Error404Page } from './Error404Page';
import { Error500Page } from './Error500Page';

const ErrorsRouting = () => {
  return (
    <Routes>
      <Route element={<ErrorsLayout />}>
        <Route path="404" element={<Error404Page />} />
        <Route path="500" element={<Error500Page />} />
        <Route path="*" element={<Navigate to="/error/404" replace={false} />} />
      </Route>
    </Routes>
  );
};

export { ErrorsRouting };
