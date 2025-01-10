'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CodeCompiler() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    socketRef.current = new WebSocket('wss://compiler.skillshikshya.com/ws/compiler/')

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established')
    }

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'stdout') {
        setOutput(prev => prev + data.data)
      }
    }

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed')
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  const runCode = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setIsRunning(true)
      setOutput('')
      socketRef.current.send(JSON.stringify({
        command: 'run',
        code,
        language,
        input
      }))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  const stopCode = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        command: 'stop'
      }))
      setIsRunning(false)
    }
  }

  const sendInput = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        command: 'input',
        input: input + '\n'
      }))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Code Compiler</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Textarea
            value={code}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>  ) => setCode(e.target.value)}
            placeholder="Enter your code here"
            className="h-64 mb-2"
          />
          <div className="flex items-center space-x-2 mb-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runCode} disabled={isRunning}>Run</Button>
            <Button onClick={stopCode} disabled={!isRunning}>Stop</Button>
          </div>
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder="Enter input here"
            className="h-32 mb-2"
          />
          <Button onClick={sendInput} disabled={!isRunning}>Send Input</Button>
        </div>
        <div>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here"
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}
