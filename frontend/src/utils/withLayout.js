import Layout from '../components/Layout';

const withLayout = (Component) => {
  return (props) => (
    <Layout navigation={props.navigation}>
      <Component {...props} />
    </Layout>
  );
};

export default withLayout;
  