import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import {io} from 'socket.io-client'

import 'quill/dist/quill.snow.css'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3]}],
    [{ font: []}],
    [{ list: "ordered"}, { list: "bullet"}],
    ["bold", "italic", "underline"],
    [{ color: []}, { background: []}],
    [{ align: []}],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor() {
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    // Setup the connection to the server socket
    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    // Recieve changes from the server and add them to quill
    useEffect(() => {
        if(socket == null || quill == null) return

        const handler = (delta) => {
            quill.updateContents(delta)
        }
        socket.on('recieve-changes', handler)

        return () => {
            socket.off('recieve-change', handler)
        }
    }, [socket, quill])

    // Send changes to the server
    useEffect(() => {
        if(socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if(source !== 'user') return
            socket.emit("send-changes", delta)
        }
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler)
        }
    }, [socket, quill])

    // When the html with ref wrapperRef is created execute this code
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        // Clear any previous wrapper and instantiate a new one
        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)

        const q = new Quill(editor, {theme: 'snow', modules: {toolbar:TOOLBAR_OPTIONS}})
        setQuill(q)
    }, [])

    return <div class="container" ref={wrapperRef}></div>
}
