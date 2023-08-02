import { useState, useEffect } from 'react'
import { Button, Box, Grid, Typography } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import LinearProgress from '@mui/material/LinearProgress'
import LoadingButton from '@mui/lab/LoadingButton'

export default function HomePage() {
  function LinearProgressWithLabel(props) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    )
  }
  const [filename, setFilename] = useState('')
  const [apkName, setApkName] = useState('')
  const [messageHistory, setMessageHistory] = useState([])
  const [submit, setSubmit] = useState(false)
  const [loading, setLoading] = useState(false)
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    'ws://137.184.43.234:5000/stream',
  )
  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage))
    }
  }, [lastMessage, setMessageHistory])
  const handleFileUpload = async (e) => {
    setLoading(true)
    if (!e.target.files) {
      return
    }
    const file = e.target.files[0]
    const { name } = file
    setFilename(name)
    const formData = new FormData()
    formData.append('file', file)

    fetch('http://137.184.43.234:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((response) => setApkName(response.name))
      .then((response) => setLoading(false))
      .then((response) => setSubmit(true))
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]
  const callWebsocket = (e) => {
    sendMessage(apkName)
  }
  return (
    <Grid
      container
      spacing={4}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh' }}
    >
      <Grid
        direction={'column'}
        container
        justifyContent={'center'}
        alignItems="center"
        maxWidth={600}
      >
        <Grid
          item
          xs={3}
          container
          justifyContent={'center'}
          alignItems="center"
        >
          <LoadingButton
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ marginRight: '1rem' }}
            loading={loading == true}
            disabled={messageHistory.length > 0}
          >
            Select APK
            <input
              type="file"
              accept=".apk"
              hidden
              onChange={handleFileUpload}
            />
          </LoadingButton>
          {filename.length != 0 ? filename : ''}
        </Grid>
        <Button
          disabled={submit == false || messageHistory.length > 0}
          onClick={callWebsocket}
        >
          Submit
        </Button>
        <Grid container>
          <Grid xs item>
            <LinearProgressWithLabel
              value={messageHistory.length * 10}
              variant="determinate"
              title="test"
            />
          </Grid>
        </Grid>
        <Grid justifyContent="center" alignItems={'center'}>
          {messageHistory.map((message, idx) => (
            <Grid xs item key={idx}>
              {message ? message.data : null}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}
