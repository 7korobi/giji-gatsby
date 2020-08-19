import React from 'react'
import { RootLayout } from './src/components/layout'

/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it

export const wrapRootElement = ({ element }) => <RootLayout ssr={true}>{element}</RootLayout>
