import React from "react";
// import { renderToString } from 'react-dom/server';

type IFirstPageProps = {};

export const FirstPage = (_: IFirstPageProps): JSX.Element => {
  return (
    <div>
      <h1>1ページ目です</h1>
    </div>
  );
};

export const getFirstPageHTML = async (
  props: IFirstPageProps,
): Promise<string> => {
  const ReactDOMServer = (await import("react-dom/server")).default;
  return ReactDOMServer.renderToString(<FirstPage />);
  // return renderToString(<FirstPage {...props} />)
};
