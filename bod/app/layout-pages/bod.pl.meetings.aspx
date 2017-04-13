<%@ Page language="C#"   Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceholderID="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue id="PageTitle" FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">
<div data-name="WebPartZone">
    <div>
        <WebPartPages:WebPartZone runat="server" ID="bodMeetingsTmp" AllowPersonalization="False" FrameType="TitleBarOnly" Orientation="Vertical" PartChromePadding="0px"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
    </div>
</div>

<!--Start: BOD PageLayout -->
<div class="row bod-page">
    <div class="col-sm-12 col-md-8 col-lg-9">
        <section class="bod-module-wrapper" id="bodAgendaDetailsWrapper">
            <h3 class="bod-module__title b-b-1 p-b-2">
                Meetings
                <span class="pull-right">
                    <button type="button" class="btn-link" id="btnOpenAddEditMeetingModal">
                        <i class="fa fa-plus" aria-hidden="true"></i>
                        Add Meetings
                    </button>
                </span>
            </h3>
            <div class="bod-module">
                <div class="row" id="bodMeetings">                
                </div>
            </div>
        </section>
    </div>
    <div class="col-sm-12 col-md-4 col-lg-3">
        <section class="bod-profile" id="bodUserProfile"></section>
    </div>
</div>
<!-- Start : All BOD Modal-->
<div id="bodMeetingsModalWrapper"></div>
<div id="bodMeetingsSuccessModalWrapper"></div>

<!-- End : All BOD Modal-->
<!--End: BOD PageLayout -->
</asp:Content>
