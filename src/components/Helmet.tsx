import { FC } from 'react'
import { Helmet as ReactHelmet } from 'react-helmet'

type Props = {
  title?: string
  isRoot?: boolean
}

export const Helmet: FC<Props> = ({ title = '', isRoot = false }) => (
  <ReactHelmet>
    <title>{!isRoot ? `${title} - ` : ''}미니앱게임천국👼</title>
  </ReactHelmet>
)
