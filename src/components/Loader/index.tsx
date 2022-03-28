import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

function Loader() {
  return (
    <div className="loader-wrap">
      <CircularProgress size={120} color="inherit" />
    </div>
  )
}

export default Loader
