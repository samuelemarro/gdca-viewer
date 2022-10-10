import Document, { Html, Head, Main, NextScript } from 'next/document';
import { RecoilRoot } from 'recoil';

export default class MyDocument extends Document {
  render() {
    const pageProps = this.props?.__NEXT_DATA__?.props?.pageProps;
    return (
      <Html>
        <Head />
        <body className="theme-green">
            <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}