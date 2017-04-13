<%@ Page language="C#"   Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceholderID="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue id="PageTitle" FieldName="Title" runat="server"/>
</asp:Content>
<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">
<div data-name="WebPartZone">
    <div>
        <WebPartPages:WebPartZone runat="server" ID="bodMeetingDashboardTmp" AllowPersonalization="False" FrameType="TitleBarOnly" Orientation="Vertical" PartChromePadding="0px"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
    </div>
</div>
<!--Start: BOD PageLayout -->
<div class="row bod-page">
    <div class="col-sm-12 col-md-8 col-lg-9">
        <!--Start: BOD Calendar Navigation -->
        <section class="" id="bodNavigation"></section>
        <!--End: BOD Calendar Navigation -->
        <div class="row">
            <div class="col-sm-12 col-md-9">
                <!--Start: BOD Breadcrumbs -->
                <ul class="bod-breadcrumbs" id="bodBreadcrumbs"></ul>
                <!--End: BOD Breadcrumbs -->
            </div>
            <div class="col-sm-12 col-md-3 m-y-4">
                <button type="button" class="btn btn--secondary btn-block" id="btnAddMeeting">
                    <i class="fa fa-plus" aria-hidden="true"></i>
                    Add Meeting
                </button>
            </div>
        </div>

        <!--Start: BOD Blocks -->
        <section class="bod-block m-b-4 hidden" id="bodMeetingDetailsWrapper">
            <header class="bod-block__header">
                <i class="fa fa-calendar" aria-hidden="true"></i>
                Meeting Details
            </header>
            <div class="bod-block__body" id="bodMeetingDesc">

            </div>
        </section>
        <!--End: BOD Blocks -->
        <!--Start: BOD Module Wrapper-->
        <section class="bod-module-wrapper hidden" id="bodAgendaDetailsWrapper">
            <h3 class="bod-module__title b-b-1 p-b-2">
                Agenda<span class="pull-right">
                    <button type="button" class="btn-link" id="btnOpenAddEditAgendaModal">
                        <i class="fa fa-plus" aria-hidden="true"></i>
                        Add Agenda
                    </button>
                </span>
            </h3>
            <div class="bod-module">

                <!--Start: BOD List Group -->
                <ul class="bod-list-group bod-list-group--brdless-a list-group m-b-0" id="bodAgenda"></ul>
                <!--End: BOD List Group -->

            </div>
        </section>
        <!--End: BOD Module Wrapper-->
    </div>
    <div class="col-sm-12 col-md-4 col-lg-3">
        <section class="bod-profile" id="bodUserProfile"></section>

        <section class="bod-event hidden" id="bodEventDetailsWrapper">
            <header class="bod-event__header">Event</header>
            <div class="bod-event__body">
                <ul class="bod-event__list" id="bodEvent"></ul>
            </div>
            <footer class="bod-event__footer">
                <div class="bod-dropdown bod-dropdown--block btn-group" role="group" id="bodEventAttendance">


                </div>
                <div id="bodEventAttendanceContentLoader"></div>
            </footer>
        </section>

        <section class="bod-panel panel panel-default hidden" id="bodMeetingAttendanceWrapper">
            <div class="panel-heading">Members</div>
            <div class="panel-body p-a-0">
                <div class="bod-accordion panel-group" id="bodMeetingAttendance" role="tablist" aria-multiselectable="true">
                </div>
            </div>
        </section>
    </div>
</div>
<!-- Start : All BOD Modal-->
<div id="bodAgendaModalWrapper"></div>

<!-- End : All BOD Modal-->
<!--End: BOD PageLayout -->
</asp:Content>
