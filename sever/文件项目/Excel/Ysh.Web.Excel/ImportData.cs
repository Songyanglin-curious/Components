using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;

namespace Ysh.Web.Excel
{
    public class ImportData
    {
        public class ResponseMessage
        {
            public bool state { get; set; }
            public string message { get; set; }
        }
        public static string ResMessage(bool state, string message)
        {
            //return "{\"state\":" + (state ? "true" : "false") + ",\"message\":\"" + message + "\"}";
            var response = new ResponseMessage
            {
                state = state,
                message = message
            };

            return JsonConvert.SerializeObject(response);
        }

        private static string Import(HttpPostedFile f, string template, string config)
        {
            if (f.ContentLength <= 0)
            {
                return ResMessage(false, "上传的excel为空");
            }
            //1.判断文件名的后缀是否为xls、xlsx
            string lastName = System.IO.Path.GetExtension(f.FileName);
            Ysh.Excel.ExcelType eType = Ysh.Excel.ImportData.GetExcelType(lastName);
            if (eType == Ysh.Excel.ExcelType.Invalid)
            {
                //throw new Exception("不支持的文件格式！");
                return ResMessage(false, "上传文件格式不正确，仅支持excel,请检查后重试。");
            }
            Ysh.Excel.ImportData imp = new Ysh.Excel.ImportData();
            var request = System.Web.HttpContext.Current.Request;
            //接收参数如一些默认值 ID等
            foreach (string a in request.QueryString.AllKeys)
            {
                imp.SetArgumtent(a.ToUpper(), request.QueryString[a]);
            }
            //Excel导入的配置文件
            template = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "conn/cllfile/" + template + "." + (eType == Ysh.Excel.ExcelType.Xls ? "xls" : "xlsx"));
            //执行导入逻辑，判断是否成功 并返回结果
            if (imp.Import(eType, f.InputStream, template, config))
                return ResMessage(true, "导入数据成功");
            else
                return ResMessage(false, imp.ErrorMessage);
        }
        
        /// <summary>
        /// 该template和config从参数读取 ，所有exce字段不能有template和config两个关键词
        /// 模板文件路径目前固定为/conn/cllfile/下
        /// </summary>
        /// <param name="f"></param>
        /// <returns></returns>
        public static string ImportByConfig(HttpPostedFile f)
        {
            var request = System.Web.HttpContext.Current.Request;
            string template = request.QueryString["template"];
            string config = request.QueryString["config"];
            if(String.IsNullOrEmpty(template))return ResMessage(false, "template 导入Excel模板不能为空");
            if (String.IsNullOrEmpty(config)) return ResMessage(false, "config   导入配置文件不能为空");
            return Import(f, template, config);
        }

        public static string ImportDJBiaozhun(HttpPostedFile f)
        {
            return Import(f,"dingjian_biaozhun_t","main/import:DingjianBiaozhun");
        }
    }
}
