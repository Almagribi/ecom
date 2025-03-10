import { Helmet, HelmetProvider } from "react-helmet-async";

const MetaData = ({ title, desc }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
      </Helmet>
    </HelmetProvider>
  );
};

export default MetaData;
