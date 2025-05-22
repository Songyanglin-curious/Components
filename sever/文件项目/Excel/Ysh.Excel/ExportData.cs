using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NPOI.XSSF.UserModel;
using System.IO;
using NPOI.SS.UserModel;
using NPOI.HSSF.UserModel;

namespace Ysh.Excel
{
    public class ExportData
    {
        /// <summary>
        /// 填充excel表格公用方法
        /// </summary>
        /// <param name="filler"></param>
        /// <param name="iSheet">sheet工作表的索引（值为数字）</param>
        /// <param name="lsData">用于填充的数据</param>
        /// <param name="lsColName">列名</param>
        private static void FillCommonExcel(GudUsing.Fill.ExcelFiller filler, int iSheet, List<List<string>> lsData, List<string> lsColName)
        {
            GudUsing.Fill.Content content = new GudUsing.Fill.Content();
            filler.setCurSheet(iSheet);
            //int iIndex = 0;
            List<List<string>> arr = new List<List<string>>();
            for (int i = 0; i < lsColName.Count; i++)
                arr.Add(new List<string>());
            foreach (var s in lsData)
            {
                for (int i = 0; i < lsColName.Count; i++)
                    arr[i].Add(s[i]);
            }
            for (int i = 0; i < lsColName.Count; i++)
            {
                content.Add(lsColName[i], arr[i]);
            }
            content.fillCell(filler, null, true);
        }

        private static void FillContent(GudUsing.Fill.Content content, string[] fields, System.Collections.IList data)
        {
            int cols = fields.Length;
            List<string>[] vv = new List<string>[cols];
            foreach (System.Collections.IList row in data)
            {
                for (int i = 0;i < cols;i++)
                {
                    if (vv[i] == null)
                        vv[i] = new List<string>();
                    vv[i].Add(row[i].ToString());
                }
            }
            for (int i = 0;i < cols;i++)
            {
                content.Add(fields[i], vv[i]);
            }
        }

        public static bool FillContents(GudUsing.Fill.Content content,AjaxPro.JavaScriptObject[] args)
        {
            var result = (new PDP()).Execute(args);
            if (!((bool)result[0]))
                return false;
            System.Collections.IList data = result[1] as System.Collections.IList;
            for (int i = 0;i < data.Count;i++)
            {
                MyAjaxObject item = data[i] as MyAjaxObject;
                string f = item["fields"].ToString();
                object d = item["data"];
                FillContent(content, f.Split(','), d as System.Collections.IList);
            }
            return true;
        }

        /// <summary>
        /// 根据模板和取数接口导出excel内容到stream中
        /// </summary>
        /// <param name="s">输出流</param>
        /// <param name="template">模板文件</param>
        /// <param name="json">取数接口信息</param>
        public static void Export(Stream s, string template, string json)
        {
            AjaxPro.JavaScriptObject[] args = AjaxPro.JavaScriptDeserializer.Deserialize(json, typeof(AjaxPro.JavaScriptObject[])) as AjaxPro.JavaScriptObject[];
            if (args == null)
                throw new Exception("参数错误");

            GudUsing.Fill.Content content = new GudUsing.Fill.Content();
            using (DBAdapte.DBAdapterManager m = YshGrid.CreateDBManager())
            {
                if (!FillContents(content,args))
                    throw new Exception("获取数据错误");
            }
            string extension = Path.GetExtension(template);
            IWorkbook wk;
     
            using (FileStream fs = File.OpenRead(template))
            {
                if (extension.Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                {
                    wk = new XSSFWorkbook(fs);
                }
                else if (extension.Equals(".xls", StringComparison.OrdinalIgnoreCase))
                {
                    wk = new HSSFWorkbook(fs);
                }
                else
                {
                    throw new Exception("Unsupported file format");
                }
                
                GudUsing.Fill.SimpleExcelFiller filler = new GudUsing.Fill.SimpleExcelFiller(wk);
                GudUsing.Fill.Template t = null;
                for (int i = 0; i < wk.NumberOfSheets; i++)
                {
                    filler.setCurSheet(i);
                    t = content.fillCell(filler, t, t == null);
                }
            }
            wk.Write(s);
        }

        public static MemoryStream Export(string template,string json)
        {
            MemoryStream ms = new MemoryStream();
            Export(ms, template, json);
            return ms;
        }
    }
}
