import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import {io} from 'socket.io-client'
import {useParams} from 'react-router-dom'

import 'quill/dist/quill.snow.css'

const SAVE_INTERVAL_MS = 2000
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
    const {id: documentId} = useParams()
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

    // Get a document by its id
    useEffect(() => {
        if(socket == null || quill == null) return

        socket.once('load-document', document => {
            quill.setContents(document)
            quill.enable()
        })

        socket.emit('get-document', documentId)
    }, [socket, quill, documentId])

    // Automatically save the document
    useEffect(() => {
        if(socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

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
        q.disable()
        q.setText('Loading...')
        setQuill(q)
    }, [])

    return <div class="container" ref={wrapperRef}></div>
}
