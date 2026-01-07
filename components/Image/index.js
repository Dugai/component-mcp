import React, { Component } from 'react'
import DefaultSrc from 'assets/images/defaultSrc.png'
import { loadImage } from 'utils/util'
import './index.moudle.less'

class Image extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      ratio: 1,
      fit: 'contain', // obejct-fit contain/cover
    }
  }

  componentDidMount() {
    this.renderImage()
  }

  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.renderImage()
    }
  }

  renderImage() {
    const { url, ratio = 1 } = this.props
    url && loadImage(url).then(img => {
      const curr = img.naturalWidth / img.naturalHeight
      if (curr > ratio) {
        this.setState({ fit: 'cover', url, ratio })
      } else {
        this.setState({ fit: 'contain', url, ratio })
      }
    }).catch(() => {
      this.setState({ url: DefaultSrc, ratio })
    })
  }

  render() {
    const { url, fit } = this.state
    return (
      <div className="image-wrap">
        { url ? <img src={url} object-fit={fit} alt="" /> : null }
      </div>
    )
  }
}

export default Image
