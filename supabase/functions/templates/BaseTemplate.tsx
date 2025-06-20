/** @jsxImportSource npm:react */
import React from 'npm:react';
import { Html, Head, Body, Container } from 'npm:@react-email/components';

export function BaseTemplate(props: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#ffffff',
          margin: 0,
        }}
      >
        <Container style={{ padding: '32px' }}>{props.children}</Container>
      </Body>
    </Html>
  );
}
