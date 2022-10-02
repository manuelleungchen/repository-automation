import React from 'react'
import { IconFolderOpen, IconFile, IconFolder } from './icons'

function FilesViewer({ files, onBack, onOpen }) {
  return (
    <table className='table'>
        <tbody>
            <tr className="clickable" onClick={onBack}>
                <td className="icon-row">
                    <IconFolderOpen />
                </td>
                <td>...</td>
                <td></td>
            </tr>
            {files.map(({ name, directory, size }) => {
                return (
                    <tr className="clickable" onClick={() => directory && onOpen(name)}>
                        <td className="icon-row">
                            {directory ? <IconFolder /> : <IconFile />}
                        </td>
                        <td>{name}</td>
                        <td>
                            <span className='float-end'>{size}</span>
                        </td>
                    </tr>
                )
            })}
        </tbody>
    </table>
  )
}

export default FilesViewer