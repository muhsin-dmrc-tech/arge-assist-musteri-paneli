import { useLayout } from '@/providers';
import { Demo1LightSidebarPage } from '../';

const DefaultPage = () => {
  const { currentLayout } = useLayout();
  return <Demo1LightSidebarPage />;
};

export { DefaultPage };
