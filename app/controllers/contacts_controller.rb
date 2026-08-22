class ContactsController < ApplicationController
  rate_limit to: 5, within: 15.minutes,
             by: -> { request.remote_ip },
             with: :render_rate_limited,
             only: :create,
             name: "contact-ip"
  rate_limit to: 3, within: 1.hour,
             by: -> { rate_limit_key(params.dig(:contact, :email)) },
             with: :render_rate_limited,
             only: :create,
             name: "contact-email"

  def new
    @contact = Contact.new
  end

  def create
    return head :bad_request if params[:website].present?

    @contact = Contact.new(contact_params)

    if @contact.valid?
      ContactMailer.contact_email(
        @contact.name,
        @contact.email,
        @contact.message
      ).deliver_now

      redirect_to root_path, notice: t("flash.contacts.sent")
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

    def contact_params
      params.require(:contact).permit(:name, :email, :message)
    end
end
