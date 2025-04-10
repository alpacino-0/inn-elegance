import React from 'react'

function ErrorPage({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `Bir hata oluştu: ${statusCode}`
        : 'İstemci tarafında bir hata oluştu'}
    </p>
  )
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage 