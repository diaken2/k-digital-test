import { UserLoginResult } from './typings'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

import PdfPlaceholder from './assets/images/Pdf.jpg'
import PngPlaceholder from './assets/images/Png.jpg'
import JpegPlaceholder from './assets/images/jpeg.jpg'
import ExcelPlaceholder from './assets/images/excel.jpg'
import PptPlaceholder from './assets/images/PPT.jpg'
import WordPlaceholder from './assets/images/word.jpg'
import BmpPlaceholder from './assets/images/bmp.png'
import OthersPlaceholder from './assets/images/others.png'
import html2pdf from 'html2pdf.js'
import { getDocument } from 'pdfjs-dist'
export function getUserInfo(): UserLoginResult | undefined {
  const user = localStorage.getItem('user')
  if (!user) return
  return JSON.parse(user)
}
const printMessage =
  'Откроется новая вкладка, где сформируется документ для печати, а затем появится диалог печати. Пока он не появится, вернитесь на первую вкладку. После выполнения скрипта будет сообщена информация о завершении.'
const succPrintMessage =
  'Документ успешно сформирован, переходите в открывщуюся вкладку!'

export const downloadFile = (pdforimg: any, docName: any) => {
  if (pdforimg?.file?.url) {
    const request = new Request(pdforimg.file.url, {
      credentials: 'include',
      headers: new Headers(),
    })

    fetch(request)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = docName
        a.click()
        window.URL.revokeObjectURL(url)
      })
  }
}
export function getRole(): any {
  const role = localStorage.getItem('role')
  if (!role) return
  return role
}
// В данной функции я использую библиотеку html2pdf, первым аргументом передаю блок, а вторым некоторые опции
export const savePdf = (block: any, data: any) => {
  if (!block && !data) {
    return
  }
  const element = document.getElementById(block)
  const opt = {
    filename: `order_${data}_${block}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: window.devicePixelRatio, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf(element, opt)
}

//Я знал, что это здесь, просто решил попробовать сам написать логику :)
export function printOrDownloadDoc(
  docRef: any,
  print: boolean,
  scale?: number,
) {
  if (!docRef.current) return

  html2canvas(docRef.current || docRef, {
    scale: scale || 5,
    logging: false,
    useCORS: true,
    backgroundColor: null,
  }).then((canvas) => {
    const pdf = new jsPDF({
      format: 'a4',
      unit: 'mm',
      orientation: 'p',
    })

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    const imgData = canvas.toDataURL()

    // pdf.addPage('a4', 'p')
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      position,
      // 208,
      imgWidth,
      imgHeight,
      // (canvas.height / canvas.width) * 208,
      undefined,
      'SLOW',
    )
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    print ? pdf.output('dataurlnewwindow') : pdf.save()
  })
}

const printPdfFromUrl = async (url: any) => {
  const loadingTask = getDocument(url)

  try {
    const pdfDocument = await loadingTask.promise
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      throw new Error('Unable to open a new window for printing')
    }

    const totalNumPages = pdfDocument.numPages
    let currentPageNum = 1

    const printPage = async (pageNum: any) => {
      const page = await pdfDocument.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.6 })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error(
          'Canvas context is null. Cannot proceed with rendering.',
        )
      }
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise
      return canvas.toDataURL('image/jpeg', 1.0)
    }

    const printDocument = async () => {
      let currentPageDataUrl
      while (currentPageNum <= totalNumPages) {
        currentPageDataUrl = await printPage(currentPageNum)

        printWindow.document.write(`<img src="${currentPageDataUrl}"/>`)
        currentPageNum += 1
      }

      printWindow.document.write(
        '<script>window.onload = function() {window.print(); window.close() }</script>',
      )
      alert(succPrintMessage)
      printWindow.document.close()
    }

    printDocument()
  } catch (error) {
    console.log('Error when trying to print:', error)
  }
}
//Данная функция создает новую вкладку, где сформировывает страницу из содержимого пдф файла
//И включает диалогове окно печати
//Таким образом размеры содержимого в пдф файле не будут разными в зависимости от размеров экранов
export const printFile = (showPicture: any) => {
  if (!showPicture?.file?.url || !showPicture?.file?.url.includes('.pdf')) {
    return
  }
  alert(printMessage)

  printPdfFromUrl(showPicture.file.url)
}

export const getImagePlaceholderFromMime = (path?: string): string => {
  if (!path) {
    path = ''
  }
  console.log(path)
  if (path.includes('.png')) {
    return PngPlaceholder
  } else if (path.includes('.pdf')) {
    return PdfPlaceholder
  } else if (path.includes('.jpg') || path.includes('.jpeg')) {
    return JpegPlaceholder
  } else if (path.includes('.xl') || path.includes('.csv')) {
    return ExcelPlaceholder
  } else if (path.includes('.doc')) {
    return WordPlaceholder
  } else if (path.includes('.ppt')) {
    return PptPlaceholder
  } else if (path.includes('.bmp')) {
    return BmpPlaceholder
  } else {
    return OthersPlaceholder
  }
}

export const phoneNumber = (phone: string): string =>
  phone[0] == '8' || phone[0] == '+' || phone[0] == '2' || phone == ''
    ? phone
    : `+${phone}`
