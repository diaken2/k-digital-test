/* eslint-disable jsx-a11y/alt-text */
import {
  CCard,
  CCardBody,
  CContainer,
  CLink,
  CPopover,
  CRow,
  CSmartTable,
  CSpinner,
  CButton,
  CModalFooter,
  CCardHeader,
  CLoadingButton,
} from '@coreui/react-pro'
import React, { createRef, useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DocumentsApi from './Documents.Api'
import { useParams } from 'react-router-dom'
import Modal from '../../components/Modal'
import Offcanvas from '../../components/Offcanvas'
import CIcon from '@coreui/icons-react'
import { cilArrowCircleLeft } from '@coreui/icons'
import { useTypedSelector } from '../../store'
import { Viewer, Worker, RenderPageProps } from '@react-pdf-viewer/core'
import { downloadFile, printFile, printOrDownloadDoc } from '../../utils'
import ReactToPrint from 'react-to-print'
import { getDocument } from 'pdfjs-dist'
import '../../scss/_custom.scss'
const CustomPageLayer: React.FC<{
  renderPageProps: RenderPageProps
}> = ({ renderPageProps }) => {
  React.useEffect(() => {
    // Mark the page rendered completely when the canvas layer is rendered completely
    // So the next page will be rendered
    if (renderPageProps.canvasLayerRendered) {
      renderPageProps.markRendered(renderPageProps.pageIndex)
    }
  }, [renderPageProps.canvasLayerRendered])

  return (
    <>
      {renderPageProps.canvasLayer.children}
      {renderPageProps.annotationLayer.children}
    </>
  )
}

const renderPdfPage = (props: RenderPageProps) => (
  <CustomPageLayer renderPageProps={props} />
)

const Document = (): JSX.Element => {
  const navigate = useNavigate()
  const [isLoadingDownload, setIsLoadingDownload] = useState(false)
  const [isLoadingPrint, setIsLoadingPrint] = useState(false)
  const [downloadFileName, setDownloadFileName] = useState('')
  const [listDocuments, setListDocuments] = useState<any[]>([])
  const [visible, setVisible] = useState(true)
  const [showPicture, setShowPicture] = useState<any>({})
  const [downloadDocument, setDownloadDocument] = useState('')
  const [downloadDocumentMimeType, setDownloadDocumentMimeType] = useState('')
  const [titleName, setTitleName] = useState('')
  const [dataFormat, setDataFormat] = useState('')
  const printDocumentFromFileViewer = useRef(null)
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const docName = searchParams.get('name')

  const getDocumentsShow = (id: any) => {
    DocumentsApi.getImageById(id).then((result: any) => {
      console.log(result)
      setShowPicture(result.data)
    })
  }

  useEffect(() => {
    getDocumentsShow(id)
  }, [id])

  return (
    <CContainer>
      <CCard>
        <CCardHeader>
          <div>{docName}</div>
        </CCardHeader>
        <CCardBody>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <p>{titleName}</p>
          </div>

          <div
            id="fileContainer"
            ref={printDocumentFromFileViewer}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {showPicture?.file?.url ? (
              <>
                {showPicture?.file?.url.includes('.pdf') ? (
                  <div
                    id="fileContainer"
                    className="pdf-viewer"
                    style={{
                      border: '1px solid rgba(0, 0, 0, 0.3)',
                      // height: '490px',
                      width: '100%',
                    }}
                  >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.5.141/build/pdf.worker.min.js">
                      <Viewer
                        ref={printDocumentFromFileViewer}
                        fileUrl={showPicture?.file?.url}
                        renderPage={renderPdfPage}
                        withCredentials={true}
                      />
                    </Worker>
                  </div>
                ) : (
                  <div id="fileContainer" ref={printDocumentFromFileViewer}>
                    <img
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      src={showPicture?.file?.url}
                    />
                  </div>
                )}
              </>
            ) : (
              <></>
            )}
          </div>
        </CCardBody>
      </CCard>
      {/*
Так же на странице "просмотр загруженного документа"  я добавил необходимые кнопки для скачивания 
и печати файла. Для печати  пдф файлов, которые отображаются с помощью Viewer, я использовал функцию
printFile, так как размер пдф файла менялся в зависимости от размера экрана,  использование 
ReactToPrint было нецелосообразным, потому что в разных устройствах у печатанного документа 
будет разный размер.       
        */}
      <div data-html2canvas-ignore className="download-print-buttons">
        {showPicture?.file?.url.includes('.pdf') ? (
          <CLoadingButton
            disabled={isLoadingPrint}
            loading={isLoadingPrint}
            onClick={() => {
              setIsLoadingPrint(true)
              new Promise((res) => {
                res(printFile(showPicture))
              }).then(() => {
                setTimeout(() => {
                  setIsLoadingPrint(false)
                }, 2000)
              })
            }}
            color="primary"
          >
            Печать
          </CLoadingButton>
        ) : (
          <ReactToPrint
            trigger={() => <CButton color="primary">Печать</CButton>}
            content={() => printDocumentFromFileViewer.current}
          />
        )}
        {/*
При скачивании файла на данной странице от html2pdf я отказался 
по той же причине, так как html2pdf сформировывает и скачивает
файл в зависимости от размера экрана. То есть Viewer подстраивает полученный от api файл под размер экрана,
использование библиотек ReactToPrint или html2pdf в этом случае не поможет, поэтому я создал функцию 
downloadFile, которая напрямую скачивает необходимый файл       
          */}
        <CLoadingButton
          disabled={isLoadingDownload}
          loading={isLoadingDownload}
          onClick={() => {
            setIsLoadingDownload(true)
            new Promise((res) => {
              res(downloadFile(showPicture, docName))
            }).then(() => {
              setTimeout(() => {
                setIsLoadingDownload(false)
              }, 2000)
            })
          }}
          color="primary"
        >
          Скачать
        </CLoadingButton>
      </div>
    </CContainer>
  )
}

export default Document
