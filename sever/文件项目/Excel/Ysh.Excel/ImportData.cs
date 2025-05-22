using Linger.Common;
using NPOI.HSSF.UserModel;
using NPOI.SS.Formula.Functions;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using PDP2;
using PDP2.IViewUI;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml;

namespace Ysh.Excel
{
    public enum ExcelType { Invalid, Xls, Xlsx }

    /// <summary>
    /// 处理Excel文件的类
    /// </summary>
    public class Excel : IDisposable
    {
        public IWorkbook Workbook { get; private set; }

        /// <summary>
        /// 构造函数，根据Excel类型和文件流初始化Workbook
        /// </summary>
        /// <param name="type">Excel文件类型</param>
        /// <param name="s">文件流</param>
        public Excel(ExcelType type, Stream s)
        {
            if (type == ExcelType.Xls)
            {
                Workbook = new HSSFWorkbook(s);
            }
            else if (type == ExcelType.Xlsx)
            {
                Workbook = new XSSFWorkbook(s);
            }
            else
            {
                throw new NotImplementedException();
            }

        }

        /// <summary>
        /// 释放资源，关闭Workbook
        /// </summary>
        public void Dispose()
        {
            Workbook.Close();
        }
    }

    /// <summary>
    /// 导入配置类
    /// </summary>
    public class ImportConfig
    {
        /// <summary>
        /// 要入库每一列的配置信息
        /// </summary>
        private class ImportColumn
        {
            public string Name { get; private set; }
            protected string Def { get; set; }
            protected string Null { get; set; }
            //col节点sql check属性
            protected string SqlNodeText { get; set; }
            protected string CheckNodeText { get; set; }
            //校验的规则集合
            public List<object> Rulers { get; private set; } = new List<object>();
            public string Desc { get; private set; }
            public ImportColumn()
            {
            }

            /// <summary>
            /// 创建导入列的实例
            /// </summary>
            /// <param name="nd">XML节点</param>
            /// <returns>导入列实例</returns>
            private static ImportColumn CreateColumn(System.Xml.XmlNode nd)
            {
           
                switch (XmlUsing.XMLHelper.GetAttribute(nd, "type"))
                {
                    //list 类型 是一个映射关系
                    case "list":
                        return new ListImportColumn();
                    default:
                        return new ImportColumn();
                }

            }

            /// <summary>
            /// 从XML加载列信息
            /// </summary>
            /// <param name="name">列名</param>
            /// <param name="xml">XML助手</param>
            /// <param name="nd">XML节点</param>
            /// <returns>导入列实例</returns>
            public static ImportColumn Load(string name, XmlHelper xml, System.Xml.XmlNode ndtop, System.Xml.XmlNode nd,Dictionary<string,string> inputs)
            {
                ImportColumn column = null;
                if (nd == null)
                    column = new ImportColumn();
                else
                {
                    //实例化
                    column = CreateColumn(nd);
                    //读取COL节点属性
                    column.LoadFromXml(xml, nd);
                    //读取SQL,并设置默认值 options
                    column.LoadFromSql(xml, ndtop, inputs);
                    //加载校验规则
                    column.LoadRulers(xml, ndtop);
                }
                column.Name = name;
                return column;
            }
            
            /// <summary>
            /// 获取列的值
            /// </summary>
            /// <param name="data">数据字典</param>
            /// <param name="inputs">输入字典</param>
            /// <returns>列的值</returns>
            public virtual object GetValue(Dictionary<string, string> data, Dictionary<string, string> inputs)
            {
                if (data.ContainsKey(Name) && !string.IsNullOrEmpty(data[Name]))
                    return data[Name];
                if (inputs.ContainsKey(Name) && !string.IsNullOrEmpty(inputs[Name]))
                    return inputs[Name];
                return GetDefaultValue();
            }

            protected object GetDefaultValue()
            {
                if (string.IsNullOrEmpty(Def))
                    return null;
                if (Def == "now")
                    return DateTime.Now;
                return Def;
            }

            /// <summary>
            /// 从XML节点加载属性
            /// </summary>
            /// <param name="xml">XML助手</param>
            /// <param name="nd">XML节点</param>
            public virtual void LoadFromXml(XmlHelper xml, System.Xml.XmlNode nd)
            {
                Def = XmlUsing.XMLHelper.GetAttribute(nd, "def");
                Null = XmlUsing.XMLHelper.GetAttribute(nd, "null");
                SqlNodeText = XmlUsing.XMLHelper.GetAttribute(nd, "sql");
                CheckNodeText = XmlUsing.XMLHelper.GetAttribute(nd, "check");
                string desc = XmlUsing.XMLHelper.GetAttribute(nd, "desc");
                Desc = string.IsNullOrEmpty(desc) ? Name : desc;


            }
            public virtual List<AjaxPro.JavaScriptArray> LoadDataFromColSql(XmlHelper xml, System.Xml.XmlNode ndtop, string sql, Dictionary<string, string> inputs)
            {
                // 获取SQL指向的node节点
                System.Xml.XmlNode SqlNode = ndtop.SelectSingleNode("sqls/" + sql);
                if (SqlNode == null)
                {
                    throw new Exception($"{ndtop.Name}下sqls 的 {sql}节点不存在");
                }

                DataLoader loader = DataLoader.Create(SqlNode);
                loader.ParseXml(xml, SqlNode);

                // 将inputs转换为Dictionary<string, object>
                Dictionary<string, object> args = inputs.ToDictionary(kvp => kvp.Key, kvp => (object)kvp.Value);

                // 准备数据列表
                List<object> data = new List<object>();

                // 获取数据并返回
                IList list = loader.GetData(data, args, null) as IList;
                List<AjaxPro.JavaScriptArray> arr = list as List<AjaxPro.JavaScriptArray>;
                return arr;
            }
            /// <summary>
            /// 从SQL加载默认值
            /// </summary>
            public virtual void LoadFromSql(XmlHelper xml, System.Xml.XmlNode ndtop,Dictionary<string,string> inputs)
            {
     
                if (!string.IsNullOrEmpty(SqlNodeText))
                {
                    List<AjaxPro.JavaScriptArray> arr = LoadDataFromColSql(xml, ndtop, SqlNodeText, inputs);
                    AjaxPro.JavaScriptArray firstRow = arr[0] ;
                    if(firstRow != null && firstRow.Count > 0)
                    {
                        Def = firstRow[0].ToString();
                    }
                    
                }
            }

            public virtual void LoadRulers(XmlHelper xml, System.Xml.XmlNode ndtop)
            {
                //一个ruler对象 必填属性为 Type Desc  其余属性根据Type不同而不同
                List<IRuler> rulers = new List<IRuler>();
                if (!string.IsNullOrEmpty(CheckNodeText))
                {
                    System.Xml.XmlNode CheckNode = ndtop.SelectSingleNode("checks/" + CheckNodeText);
                    if (CheckNode == null)
                    {
                        throw new Exception($"{ndtop.Name}下checks 的 {CheckNodeText}节点不存在");
                    }
                    foreach (System.Xml.XmlNode rulerNode in CheckNode.ChildNodes)
                    {
                        // 检查是否为注释节点
                        if (rulerNode.NodeType == System.Xml.XmlNodeType.Comment)
                        {
                            continue; // 跳过注释节点
                        }
                        string  type = rulerNode.Name.Trim().ToUpper();
                        string desc = XmlUsing.XMLHelper.GetAttribute(rulerNode, "desc");
                        switch (type)
                        {
                            case "NOTNULL":
                                rulers.Add(new NotNullRuler(desc));
                                break;
                            case "RANGE":
                                string dataType = XmlUsing.XMLHelper.GetAttribute(rulerNode, "type");
                                dataType = dataType.Trim().ToUpper();
                                string minValue = XmlUsing.XMLHelper.GetAttribute(rulerNode, "min");
                                string maxValue = XmlUsing.XMLHelper.GetAttribute(rulerNode, "max");
                                switch (dataType)
                                {
                                    case "NUMBER":
                                        rulers.Add(new NumberRangeRuler(desc, minValue, maxValue));
                                        break;
                                    case "DATETIME":
                                        rulers.Add(new DateTimeRangeRuler(desc, minValue, maxValue));
                                        break;
                                    default:
                                        rulers.Add(new NumberRangeRuler(desc, minValue, maxValue));
                                        break;
                                }
                                break;
                            case "REGEX":
                                string pattern = XmlUsing.XMLHelper.GetAttribute(rulerNode, "pattern");
                                rulers.Add(new RegexRuler(desc, pattern));
                                break;
                            default:
                                //不符合规则的节点，忽略
                                GudUsing.Log.Add($"未知的校验规则类型{type}");
                                //throw new Exception($"未知的校验规则类型{type}");
                                break;  
                        }
                    }

                }
                Rulers = rulers.Cast<object>().ToList();
            }
            /// <summary>
            /// 检查列的数据有效性
            /// </summary>
            /// <param name="data">数据字典</param>
            /// <returns>错误信息</returns>
            public virtual string Check(Dictionary<string, string> data)
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// 导入的是列类型的配置信息 继承ImportColumn ，重新实现GetValue LoadFromXml 方法  新增 options 字段 
        /// </summary>
        private class ListImportColumn : ImportColumn
        {
            private string From { get; set; }
            private Dictionary<string, string> options = null;

            /// <summary>
            /// 从XML加载列表列信息
            /// </summary>
            /// <param name="xml">XML助手</param>
            /// <param name="nd">XML节点</param>
            public override void LoadFromXml(XmlHelper xml, XmlNode nd)
            {
                base.LoadFromXml(xml, nd);
                From = XmlUsing.XMLHelper.GetAttribute(nd, "from");
                string[] arr = xml.GetNodeValue(nd).Split(',');
                options = new Dictionary<string, string>();
                for (int i = 0; i < arr.Length - 1; i += 2)
                {
                    options[arr[i + 1]] = arr[i];
                }
            }
            /// <summary>
            /// 从SQL加载options值
            /// </summary>
            public override void LoadFromSql(XmlHelper xml, System.Xml.XmlNode ndtop,  Dictionary<string, string> inputs)
            {
      
                if (!string.IsNullOrEmpty(SqlNodeText))
                {
                    List<AjaxPro.JavaScriptArray> arr = LoadDataFromColSql(xml, ndtop, SqlNodeText, inputs);
                    options = new Dictionary<string, string>();
                    for (int i = 0; i < arr.Count ; i++)
                    {
                        AjaxPro.JavaScriptArray row = arr[i];
                        string key = row[1].ToString();
                        string value = row[0].ToString();
                        if (!string.IsNullOrEmpty(key) &&  !options.ContainsKey(key))
                        {
                            options.Add(key, value);
                        }
                    }
                }
            }

            /// <summary>
            /// 获取输入值
            /// </summary>
            /// <param name="data">数据字典</param>
            /// <returns>输入值</returns>
            protected string GetInputValue(Dictionary<string, string> data)
            {
                string key = string.IsNullOrEmpty(From) ? Name : From;
                if (data.ContainsKey(key))
                    return data[key];
                return string.Empty;
            }

            /// <summary>
            /// 获取列的值
            /// </summary>
            /// <param name="data">数据字典</param>
            /// <param name="inputs">输入字典</param>
            /// <returns>列的值</returns>
            public override object GetValue(Dictionary<string, string> data, Dictionary<string, string> inputs)
            {
                string value = GetInputValue(data);
                if (options.ContainsKey(value))
                    return options[value];
                return GetDefaultValue();
            }
        }
        /// <summary>
        /// 校验规则类
        /// </summary>
   
        public interface IRuler
        {
            string Type { get;}
            string Desc { get; set; }
            bool IsValid(string value);
            string GetErrorMsg(string columnName);
        }

        public class NotNullRuler : IRuler
        {
            public string Type { get; } = "NOTNULL";
            public string Desc { get; set; }

            public NotNullRuler(string desc)
            {
                Desc = string.IsNullOrEmpty(desc)? "不能为空" : desc;
            }
            public bool IsValid(string value)
            {
                return !string.IsNullOrEmpty(value);
            }
            public string GetErrorMsg(string columnName)
            {
                return string.Format("{0}:{1}", columnName, Desc);
            }
        }

        public class NumberRangeRuler : IRuler
        {
            public string Type { get; } = "NUMBER_RANGE";
            public string Desc { get; set; }
            private double MinValue { get; set; }
            private double MaxValue { get; set; }
            private bool HasMinValue { get; set; }
            private bool HasMaxValue { get; set; }

            public NumberRangeRuler(string desc, string minValue, string maxValue)
            {
                Desc = string.IsNullOrEmpty(desc)? "数值范围错误" : desc;
                if (double.TryParse(minValue, out double dMinValue))
                {
                    MinValue = dMinValue;
                    HasMinValue = true;
                }
                if (  double.TryParse(maxValue, out double dMaxValue))
                {
                    MaxValue = dMaxValue;
                    HasMaxValue = true;
                }
            }
            //如果即不存在最小值又不存在最大值，则只判断值的类型
            public bool IsValid(string value)
            {
                if (!double.TryParse(value, out double dValue))
                    return false;
                if (HasMinValue && dValue < MinValue)
                    return false;
                if (HasMaxValue && dValue > MaxValue)
                    return false;
                return true;
            }

            public string GetErrorMsg(string columnName)
            {
                return string.Format("{0}:{1}", columnName, Desc);
            }
        }

        public class DateTimeRangeRuler : IRuler
        {
            public string Type { get; } = "DATETIME_RANGE";
            public string Desc { get; set; }
            private DateTime MinValue { get; set; }
            private DateTime MaxValue { get; set; }
            private bool HasMinValue { get; set; }
            private bool HasMaxValue { get; set; }

            public DateTimeRangeRuler(string desc, string minValue, string maxValue)
            {
                Desc = string.IsNullOrEmpty(desc)? "日期范围错误" : desc;
                if (DateTime.TryParse(minValue, out DateTime dtMinValue))
                {
                    MinValue = dtMinValue;
                    HasMinValue = true;
                }
                if (DateTime.TryParse(maxValue, out DateTime dtMaxValue))
                {
                    MaxValue = dtMaxValue;
                    HasMaxValue = true;
                }
            }
            //如果即不存在最小值又不存在最大值，则只判断值的类型
            public bool IsValid(string value)
            {
                if (!DateTime.TryParse(value, out DateTime dtValue))
                    return false;
                if (HasMinValue && dtValue < MinValue)
                    return false;
                if (HasMaxValue && dtValue > MaxValue)
                    return false;
                return true;
            }

            public string GetErrorMsg(string columnName)
            {
                return string.Format("{0}:{1}", columnName, Desc);
            }
        }

        public class RegexRuler : IRuler
        {
            public string Type { get; } = "REGEX";
            public string Desc { get; set; }
            private string Pattern { get; set; }

            public RegexRuler(string desc, string pattern)
            {
                Desc = string.IsNullOrEmpty(desc)? "正则表达式错误" : desc;
                Pattern = pattern;
            }

            public bool IsValid(string value)
            {
                if (string.IsNullOrEmpty(Pattern))
                {
                    throw new InvalidOperationException("正则表达式模式Pattern未被赋值");
                }
                return System.Text.RegularExpressions.Regex.IsMatch(value, Pattern);
            }

            public string GetErrorMsg(string columnName)
            {
                return string.Format("{0}:{1}", columnName, Desc);
            }

        }
        private XmlHelper xml;
        private string strIDField = string.Empty;
        private string strUpdateSQL = string.Empty;
        private string strInsertSQL = string.Empty;
        private List<ImportColumn> lstColumn = null;
        public string StartSQL { get; private set; }
        public string EndSQL { get; private set; }

        /// <summary>
        /// 构造函数，初始化导入配置
        /// </summary>
        /// <param name="xml">XML助手</param>
        public ImportConfig(XmlHelper xml)
        {
            this.xml = xml;
        }

        /// <summary>
        /// 从XML节点加载配置
        /// </summary>
        /// <param name="nd">XML节点</param>
        public void Load(System.Xml.XmlNode nd,Dictionary<string,string>  inputs)
        {
            DB = XmlUsing.XMLHelper.GetAttribute(nd, "db");
            //指明ID字段
            strIDField = XmlUsing.XMLHelper.GetAttribute(nd, "idcol");
            // 插入 开始 结束语句
            strInsertSQL = xml.GetNodeValue(nd.SelectSingleNode("insert"));
            StartSQL = xml.GetNodeValue(nd.SelectSingleNode("start"));
            EndSQL = xml.GetNodeValue(nd.SelectSingleNode("end"));
            //ID字段存在时，读取更新语句
            if (!string.IsNullOrEmpty(strIDField))
            {
                strUpdateSQL = xml.GetNodeValue(nd.SelectSingleNode("update"));
            }
            //fields="TEAM_ID,NAME,CATEGORY,PHONE" 指定入库的字段 SQL中占位符按照此顺序
            string[] columns = nd.Attributes["fields"].Value.Split(',');
            lstColumn = new List<ImportColumn>();
            foreach (string col in columns)
            {
                //获取入库字段的配置节点 暂时有映射  后续考虑校验 数据库读取字典map
                System.Xml.XmlNode ndCol = nd.SelectSingleNode("cols/" + col);
                //解析配置节点并且存入lstColumn
                lstColumn.Add(ImportColumn.Load(col, xml, nd, ndCol, inputs));
            }
        }

        public string DB { get; private set; }

        /// <summary>
        /// 根据格式和输入获取全局SQL
        /// </summary>
        /// <param name="db">数据库适配器</param>
        /// <param name="format">SQL格式</param>
        /// <param name="inputs">输入字典</param>
        /// <returns>生成的SQL语句</returns>
        public string GetGlobalSQL(DBAdapte.DBAdapter db, string format, Dictionary<string, string> inputs)
        {
            if (string.IsNullOrEmpty(format))
                return format;
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> args = new List<object>();
            // lstColumn 转成参数数组
            foreach (ImportColumn col in lstColumn)
            {
                args.Add(col.GetValue(data, inputs));
            }
            return db.GetSQL(format, args.ToArray());
        }

        /// <summary>
        /// 检查数据的有效性
        /// </summary>
        /// <param name="data">数据字典</param>
        /// <returns>错误信息</returns>
        public string Check(int rowIndex, Dictionary<string, string> data, Dictionary<string, string> inputs)
        {
            StringBuilder msgBuilder = new StringBuilder();

            foreach (ImportColumn col in lstColumn)
            {
                List<object> rulers = col.Rulers;
                string value = col.GetValue(data, inputs)?.ToString(); // 注意 null 安全处理

                foreach (object ruler in rulers)
                {
                    IRuler rulerObj = ruler as IRuler;
                    if (!rulerObj.IsValid(value))
                    {
                        string errorMsg = rulerObj.GetErrorMsg(col.Desc); // 假设你能够修改此方法接受行索引
                        if (!string.IsNullOrEmpty(errorMsg))
                        {
                            msgBuilder.AppendLine($"{errorMsg}"); // 使用 StringBuilder 来拼接消息
                        }
                    }
                }
            }

            if (msgBuilder.Length > 0)
            {
                return $"第{rowIndex + 2}行：\r\n{msgBuilder}";
            }

            return string.Empty;
        }


        /// <summary>
        /// 根据数据生成SQL语句
        /// </summary>
        /// <param name="db">数据库适配器</param>
        /// <param name="data">导入Excel行数据字典</param>
        /// <param name="inputs">url所带参数输入字典</param>
        /// <returns>生成的SQL语句</returns>
        public string GetSQL(DBAdapte.DBAdapter db, Dictionary<string, string> data, Dictionary<string, string> inputs)
        {
            // 根据ID字段判断是插入还是更新
            string strFormat = strInsertSQL;
            if ((!string.IsNullOrEmpty(strIDField)) && data.ContainsKey(strIDField))
            {
                if (!string.IsNullOrEmpty(data[strIDField]))
                    strFormat = strUpdateSQL;
            }

            List<object> args = new List<object>();
            foreach (ImportColumn col in lstColumn)
            {
                args.Add(col.GetValue(data, inputs));
            }
            return db.GetSQL(strFormat, args.ToArray());
        }
    }

    /// <summary>
    /// 导入数据类
    /// </summary>
    public class ImportData
    {
        /// <summary>
        /// 储存从外界传入的参数,以字典形式储存，所有key均被大写处理
        /// </summary>
        private Dictionary<string, string> dictArg = new Dictionary<string, string>();

        /// <summary>
        /// 设置参数，外部传入的参数以字典形式储存，所有key均被大写处理
        /// </summary>
        /// <param name="type">参数类型</param>
        /// <param name="value">参数值</param>
        public void SetArgumtent(string type, string value)
        {
            dictArg[type] = value;
        }

        public string ErrorMessage { get; private set; }

        /// <summary>
        /// 根据文件扩展名获取Excel类型
        /// </summary>
        /// <param name="ext">文件扩展名</param>
        /// <returns>Excel类型</returns>
        public static Ysh.Excel.ExcelType GetExcelType(string ext)
        {
            switch (ext.ToLower())
            {
                case ".xls": return Ysh.Excel.ExcelType.Xls;
                case ".xlsx": return Ysh.Excel.ExcelType.Xlsx;
                default: return Ysh.Excel.ExcelType.Invalid;
            }
        }
        /// <summary>
        /// 导入Excel的主逻辑，执行导入的开始节点
        /// </summary>
        /// <param name="type">Excel文件类型</param>
        /// <param name="s">文件流</param>
        /// <param name="template">Excel导入模板</param>
        /// <param name="strNode">Import</param>
        /// <returns>导入是否成功</returns>
        public bool Import(ExcelType type, Stream s, string template, string strNode)
        {
            try
            {


                if (s.Length == 0)
                {
                    ErrorMessage = "导入文件内容为空";
                    return false;
                }
                //按照模板读取数据
                Dictionary<string, GudUsing.Fill.JsObject<string>> data = GetDataFromExcel(type, s, template);
                #region 读取导入配置节点
                string[] arr = strNode.Split(':');
                Linger.Common.XmlHelper xml = new XmlHelper(arr[0] + ".xml");
                System.Xml.XmlNode nd = xml.GetXmlNode(arr[1]);
                ImportConfig cfg = new ImportConfig(xml);
                cfg.Load(nd, dictArg);
                #endregion

                #region Excel数据入库
                string strFirstKey = string.Empty;
                foreach (string key in data.Keys)
                {
                    strFirstKey = key;
                    break;
                }
                if (string.IsNullOrEmpty(strFirstKey))
                {
                    ErrorMessage = "导入数据不正确";
                    return false;
                }
                //DataLoader loader = DataLoader.Create(xml);

                GudUsing.Fill.JsObject<string> dataOfOneField = data[strFirstKey];
                int nCount = dataOfOneField.length;
                List<string> lstSQL = new List<string>();

                //对整个EXCEL的数据进行校验
                StringBuilder allErrorMsg = new StringBuilder();
                for (int i = 0; i < nCount; i++)
                {
                    Dictionary<string, string> row = GetRowData(data, i);
                    if (IsEmptyRow(row))//整行数据都没有，不要
                        continue;
                    string errorMsg = cfg.Check(i, row, dictArg);
                    if (!string.IsNullOrEmpty(errorMsg))
                    {
                        allErrorMsg.AppendLine(errorMsg);
                    }
                }
                if (allErrorMsg.Length > 0)
                {
                    ErrorMessage = allErrorMsg.ToString();
                    GudUsing.Log.Add(ErrorMessage);
                    return false;
                }
                // 指定要连接的数据库
                using (DBAdapte.DBAdapter db = DBAdapte.DBAdapter.FromConnCfg(cfg.DB))
                {
                    string strStartSQL = cfg.GetGlobalSQL(db, cfg.StartSQL, dictArg);
                    if (!string.IsNullOrEmpty(strStartSQL))
                        lstSQL.Add(strStartSQL);


                    for (int i = 0; i < nCount; i++)
                    {
                        Dictionary<string, string> row = GetRowData(data, i);
                        if (IsEmptyRow(row))//整行数据都没有，不要
                            continue;
                        //检查的是Excel的数据而非和配置文件组合后的数据
                        //string check = cfg.Check(row);
                        //if (!string.IsNullOrEmpty(check))
                        //{
                        //    ErrorMessage = "第" + (i + 1) + "行" + check;
                        //    return false;
                        //}
                        lstSQL.Add(cfg.GetSQL(db, row, dictArg));
                    }
                    string strEndSQL = cfg.GetGlobalSQL(db, cfg.EndSQL, dictArg);
                    if (!string.IsNullOrEmpty(strEndSQL))
                        lstSQL.Add(strEndSQL);
                    db.Open();
                    db.ExecuteHugeCommands(lstSQL);
                }
                #endregion
                return true;
            }
            catch (Exception e)
            {
                ErrorMessage = e.Message;
                return false;
            }
        }

        /// <summary>
        /// 从Excel获取数据
        /// </summary>
        /// <param name="type">Excel类型</param>
        /// <param name="stream">文件流</param>
        /// <param name="template">模板路径</param>
        /// <returns>获取到的数据字典</returns>
        public static Dictionary<string, GudUsing.Fill.JsObject<string>> GetDataFromExcel(ExcelType type, Stream stream, string template)
        {
            List<string> keyarr = new List<string>();
            using (FileStream sr = new FileStream(template, FileMode.Open, FileAccess.ReadWrite))
            {
                using (Excel excelTemplate = new Excel(type, sr))
                {
                    using (Excel excelImport = new Excel(type, stream))
                    {
                        GudUsing.Fill.ExcelImporterEx imp = new GudUsing.Fill.ExcelImporterEx();
                        return imp.Import(excelTemplate.Workbook, excelImport.Workbook);
                    }
                }
            }
        }

        /// <summary>
        /// 获取某一行的数据
        /// </summary>
        /// <param name="data">数据字典</param>
        /// <param name="i">行索引</param>
        /// <returns>行数据字典</returns>
        public static Dictionary<string, string> GetRowData(Dictionary<string, GudUsing.Fill.JsObject<string>> data, int i)
        {
            Dictionary<string, string> dict = new Dictionary<string, string>();
            foreach (KeyValuePair<string, GudUsing.Fill.JsObject<string>> kv in data)
            {
                dict[kv.Key] = kv.Value[i];
            }
            return dict;
        }

        /// <summary>
        /// 检查是否为空行
        /// </summary>
        /// <param name="row">行数据字典</param>
        /// <returns>是否为空行</returns>
        public static bool IsEmptyRow(Dictionary<string, string> row)
        {
            foreach (KeyValuePair<string, string> kv in row)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                    return false;
            }
            return true;
        }
    }

    /// <summary>
    /// 消息类
    /// </summary>
    public class Message
    {
        public bool state { get; set; }
        public string message { get; set; }

        /// <summary>
        /// 转换为JSON格式
        /// </summary>
        /// <returns>JSON字符串</returns>
        public string ToJson()
        {
            return "{" + string.Format("\"state\":{0},\"message\":{1}", state ? "true" : "false", AjaxPro.JavaScriptSerializer.Serialize(message)) + "}";
        }
    }

    /// <summary>
    /// 导入设备数据的内部类
    /// </summary>
    internal class ImportDevData
    {
        /// <summary>
        /// 生成响应消息
        /// </summary>
        /// <param name="state">状态</param>
        /// <param name="message">消息内容</param>
        /// <returns>JSON格式的响应消息</returns>
        public static string ResMessage(bool state, string message)
        {
            Message msg = new Message();
            msg.state = state;
            msg.message = message;
            string resMsg = msg.ToJson();
            return resMsg;
        }

        /// <summary>
        /// 将文件上传至UploadFiles中，并将文件内容存入数据库
        /// </summary>
        /// <param name="f">文件流</param>        
        /// <returns>响应消息</returns>
        public static string SaveFile(string suffix, Stream stream)
        {
            if (stream.Length <= 0)
            {
                GudUsing.Log.Add("没有上传内容！");

                return ResMessage(false, "上传的excel为空");
            }
            //3.读取文件内容
            Dictionary<string, GudUsing.Fill.JsObject<string>> arrData;
            string getDataMsg;
            bool isGetData = GetDataFromExcel(suffix, stream, out arrData, out getDataMsg);
            //4.读取数据成功则传入数据库
            if (!isGetData)
            {
                return getDataMsg;
            }

            //5、校验读取的数据是否合格
            string cehckDataMsg;
            bool isAllow = checkTableData(arrData, out cehckDataMsg);
            if (!isAllow)
            {
                return cehckDataMsg;
            }
            //6、添加数据到数据库
            string insertDBMsg;
            bool isSuccess = InsertTable(arrData, false, out insertDBMsg);
            if (!isSuccess)
            {
                return insertDBMsg;
            }
            //都没有问题
            string resMsg = ResMessage(true, "导入数据成功");
            return resMsg;
        }

        /// <summary>
        /// 从excel读取数据，out返回
        /// </summary>
        /// <param name="fileName">要读取的文件名</param>
        /// <param name="arrData">读取到的数据</param>
        /// <param name="getDataMsg">读取状态信息</param>
        /// <returns>是否成功</returns>
        public static bool GetDataFromExcel(string suffix, Stream stream, out Dictionary<string, GudUsing.Fill.JsObject<string>> arrData, out string getDataMsg)
        {
            arrData = new Dictionary<string, GudUsing.Fill.JsObject<string>>();
            getDataMsg = ResMessage(true, "导入数据成功");
            bool success = true;
            List<string> keyarr = new List<string>();
            string Tfilename = AppDomain.CurrentDomain.BaseDirectory + "conn/cllfile/remote_dev_template." + suffix;
            //创建工作簿变量
            IWorkbook Tworkbook = null;
            IWorkbook workbook = null;
            using (FileStream sr = new FileStream(Tfilename, FileMode.Open, FileAccess.ReadWrite))
            {
                try
                {
                    if (suffix == "xls")
                    {
                        Tworkbook = new HSSFWorkbook(sr);
                        workbook = new HSSFWorkbook(stream);
                    }
                    else if (suffix == "xlsx")
                    {
                        Tworkbook = new XSSFWorkbook(sr);
                        workbook = new XSSFWorkbook(stream);
                    }
                    //GudUsing.Fill.ExcelFillerEx exo = new GudUsing.Fill.ExcelFillerEx();
                    //exp
                    GudUsing.Fill.ExcelImporterEx imp = new GudUsing.Fill.ExcelImporterEx();
                    arrData = imp.Import(Tworkbook, workbook);
                }
                catch (Exception e)
                {
                    GudUsing.Log.Add(e.Message);
                    getDataMsg = ResMessage(false, "从excel读取数据失败");
                    success = false;
                    return success;
                }
                workbook.Close();
                Tworkbook.Close();
            }
            return success;
        }

        /// <summary>
        /// 检查表格中数据是否合格，将整行为空的删掉
        /// </summary>
        /// <param name="arrData">要检查的数据字典</param>
        /// <param name="checkDateMsg">校验状态信息</param>
        /// <returns>是否合格</returns>
        public static bool checkTableData(Dictionary<string, GudUsing.Fill.JsObject<string>> arrData, out string checkDateMsg)
        {
            bool isAllow = true;
            string[] ELArr = new string[8] { "EL1", "EL2", "EL3", "EL4", "EL5", "EL6", "EL7", "EL8" };
            string[] columnNames = new string[8] { "设备名称", "场站", "操作系统", "设备类型", "角色", "数据通道", "A网IP", "B网IP" };
            checkDateMsg = ResMessage(true, "数据校验合格");
            for (int i = 0; i < arrData["EL1"].length; i++)//列
            {

                int emptyNum = 0;
                string EmptyName = "";
                //一整行为空的忽略
                //
                for (int j = 0; j < ELArr.Length; j++)//行
                {

                    string EL = ELArr[j];
                    if (String.IsNullOrEmpty(arrData[EL][i].Trim()))
                    {
                        string columnName = columnNames[j];
                        EmptyName = columnName;
                        emptyNum++;
                    }
                }
                if (emptyNum > 0 && emptyNum != ELArr.Length)
                {
                    string ErrMsg = "第" + (i + 2) + "行 " + EmptyName + " 数据为空";
                    GudUsing.Log.Add(ErrMsg);
                    checkDateMsg = ResMessage(false, ErrMsg);
                    isAllow = false;
                    return isAllow;
                }
            }
            return isAllow;
        }

        /// <summary>
        /// 向数据库中插入数据
        /// </summary>
        /// <param name="StationType_d">站点字典</param>
        /// <param name="DevType_d">设备种类字典</param>
        /// <returns>是否成功</returns>
        public static bool InsertTable(Dictionary<string, GudUsing.Fill.JsObject<string>> arrData, bool isRemote, out string insertDBMsg)
        {
            bool isSuccess = true;
            insertDBMsg = ResMessage(true, "数据添加到数据库成功");
            DBAdapte.DBAdapter db = YshGrid.GetCurrDBManager().GetDBAdapter("ConnMain");
            //XmlHelper xmlHelper = new XmlHelper(@"sysSql/device.xml");

            //Dictionary<string, List<string>> temp = new Dictionary<string, List<string>>();
            //string InsertDev = xmlHelper.GetSqlString("InsertUnregisteredDevInfo");//添加设备
            //string updateDev = xmlHelper.GetSqlString("UpdateUnregisteredDevInfo");//更新设备信息
            //string selectDev = xmlHelper.GetSqlString("SelectDevByName");//获取设备

            //string InsertLogin = xmlHelper.GetSqlString("InsertUnregisteredDevLogin");//添加设备对应的登录信息
            //string deleteLogin = xmlHelper.GetSqlString("DeleteUnregisteredDevLogin");//删除设备登录信息
            XmlHelper xmlHelper = null;
            Dictionary<string, List<string>> temp = new Dictionary<string, List<string>>();
            string InsertDev = null;
            string updateDev = null;
            string selectDev = null;
            string InsertLogin = null;
            string deleteLogin = null;
            if (isRemote)
            {
                xmlHelper = new XmlHelper(@"remoteSql/device.xml");
                InsertDev = xmlHelper.GetSqlString("InsertDevInfo");//添加设备
                updateDev = xmlHelper.GetSqlString("UpdateDevInfo");//更新设备信息
                selectDev = xmlHelper.GetSqlString("SelectDevByName");//获取设备
                InsertLogin = xmlHelper.GetSqlString("InsertDevLogin");//添加设备对应的登录信息
                deleteLogin = xmlHelper.GetSqlString("DeleteDevLogin");//删除设备登录信息
            }
            else
            {
                xmlHelper = new XmlHelper(@"sysSql/device.xml");
                InsertDev = xmlHelper.GetSqlString("InsertUnregisteredDevInfo");//添加设备
                updateDev = xmlHelper.GetSqlString("UpdateUnregisteredDevInfo");//更新设备信息
                selectDev = xmlHelper.GetSqlString("SelectDevByName");//获取设备
                InsertLogin = xmlHelper.GetSqlString("InsertUnregisteredDevLogin");//添加设备对应的登录信息
                deleteLogin = xmlHelper.GetSqlString("DeleteUnregisteredDevLogin");//删除设备登录信息
            }

            List<string> lstSql = new List<string>();
            db.BeginTransaction();
            db.ExecuteCommand("begin;");
            try
            {
                foreach (string key in arrData.Keys)
                {
                    List<string> list = new List<string>();
                    for (int i = 0; i < arrData[key].length; i++)
                    {
                        list.Add(arrData[key][i]);
                    }
                    temp.Add(key, list);
                }
                //插入用户数据
                for (int i = 0; i < temp["EL1"].Count; i++)
                {
                    if (String.IsNullOrEmpty(temp["EL1"][i].Trim()))
                    {
                        continue;
                    }
                    //添加或者更新设备信息
                    //判断数据库中是否已经存在本条数据，存在的就不再录入
                    string isHaveSql = db.GetSQL(selectDev, temp["EL1"][i]);
                    bool isHave = false;
                    string id = null;
                    using (IDataReader dataReader = db.ExecuteReader(isHaveSql))
                    {
                        isHave = dataReader.Read();
                        if (isHave)
                        {
                            id = dataReader[0].ToString();
                        }
                    }
                    //判断登录信息是否存在，存在的添加登录信息
                    if (isHave)
                    {
                        //更新设备信息
                        db.ExecuteCommand(updateDev, temp["EL1"][i], temp["EL2"][i], temp["EL3"][i], temp["EL4"][i], temp["EL5"][i], temp["EL6"][i], temp["EL7"][i], temp["EL8"][i], id);
                        //删除对应的登录信息
                        db.ExecuteCommand(deleteLogin, id);
                    }
                    else
                    {
                        id = db.ExecuteInsertCommandGetID(InsertDev, temp["EL1"][i], temp["EL2"][i], temp["EL3"][i], temp["EL4"][i], temp["EL5"][i], temp["EL6"][i], temp["EL7"][i], temp["EL8"][i]).ToString();
                    }
                    //添加设备登录信息
                    string[][] twoDArray = new string[4][]{
                        new string[4] { "EL9", "EL10","EL11","EL12"},
                        new string[4] { "EL13", "EL14","EL15","EL16"},
                        new string[4] { "EL17", "EL18","EL19","EL20"},
                        new string[4] { "EL21", "EL22","EL23","EL24"},
                    };
                    for (int j = 0; j < twoDArray.GetLength(0); j++)
                    {
                        string[] row = twoDArray[j];
                        object[] arguments = new object[5];
                        arguments[0] = id;
                        bool isContinue = false;
                        for (int k = 0; k < row.Length; k++)
                        {
                            string EL = row[k];
                            if (String.IsNullOrEmpty(temp[EL][i]))
                            {
                                isContinue = true;
                                break;
                            }
                            arguments[k + 1] = temp[EL][i];
                        }
                        if (isContinue)
                        {
                            continue;
                        }
                        db.ExecuteCommand(InsertLogin, arguments);
                    }
                }
                if (lstSql.Count > 0)
                    db.ExecuteHugeCommands(lstSql, 200);
                //测试回滚
                /*lstSql.Add(db.GetSQL(InsertBreaker, "aaa", "bbb"));
                db.ExecuteHugeCommands(lstSql, 200);
                db.RollbackTransaction();
                db.ExecuteCommand("rollback;");*/
            }
            catch (Exception e)
            {
                GudUsing.Log.Add("插入数据失败：" + e.Message);
                db.RollbackTransaction();
                db.ExecuteCommand("rollback;");
                insertDBMsg = ResMessage(false, "数据导入数据库失败");
                isSuccess = false;
                return isSuccess;
            }
            db.CommitTransaction();
            db.ExecuteCommand("commit;");
            return isSuccess;
        }
    }
}

